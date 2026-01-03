import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  CreateHabitSchema,
  UpdateHabitSchema,
  CreateHabitEntrySchema,
  CreateJournalEntrySchema,
} from "@/shared/types";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Development mode check
const isDevelopment = (env: Env) => {
  return !env.MOCHA_USERS_SERVICE_API_KEY || !env.MOCHA_USERS_SERVICE_API_URL;
};

// Development mode middleware
const devAuthMiddleware = async (c: any, next: any) => {
  if (isDevelopment(c.env)) {
    // Mock user for development
    c.set('user', {
      id: 'dev-user-123',
      email: 'dev@example.com',
      google_sub: 'dev-sub',
      google_user_data: {
        email: 'dev@example.com',
        email_verified: true,
        name: 'Dev User',
        picture: null,
        sub: 'dev-sub',
      },
      last_signed_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await next();
  } else {
    return authMiddleware(c, next);
  }
};

// Authentication routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  if (isDevelopment(c.env)) {
    // In development, return a special dev URL that redirects to callback with dev code
    return c.json({ redirectUrl: '/auth/callback?code=dev-mode' }, 200);
  }

  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  if (isDevelopment(c.env)) {
    // In development mode, accept any code and set a mock session
    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, 'dev-session-token', {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60,
    });
    return c.json({ success: true }, 200);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", devAuthMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string' && !isDevelopment(c.env)) {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Habits routes
app.get('/api/habits', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post('/api/habits', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = CreateHabitSchema.parse(body);
  
  const result = await c.env.DB.prepare(
    "INSERT INTO habits (user_id, name, description, category, target_frequency) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(user.id, validatedData.name, validatedData.description || null, validatedData.category, validatedData.target_frequency)
    .run();

  const habit = await c.env.DB.prepare(
    "SELECT * FROM habits WHERE id = ?"
  )
    .bind(result.meta.last_row_id)
    .first();

  return c.json(habit, 201);
});

app.put('/api/habits/:id', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const habitId = c.req.param('id');
  const body = await c.req.json();
  
  const validatedData = UpdateHabitSchema.parse(body);
  
  // Check if habit belongs to user
  const habit = await c.env.DB.prepare(
    "SELECT * FROM habits WHERE id = ? AND user_id = ?"
  )
    .bind(habitId, user.id)
    .first();

  if (!habit) {
    return c.json({ error: "Habit not found" }, 404);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];
  
  if (validatedData.name !== undefined) {
    updateFields.push("name = ?");
    updateValues.push(validatedData.name);
  }
  if (validatedData.description !== undefined) {
    updateFields.push("description = ?");
    updateValues.push(validatedData.description);
  }
  if (validatedData.category !== undefined) {
    updateFields.push("category = ?");
    updateValues.push(validatedData.category);
  }
  if (validatedData.target_frequency !== undefined) {
    updateFields.push("target_frequency = ?");
    updateValues.push(validatedData.target_frequency);
  }
  
  updateFields.push("updated_at = CURRENT_TIMESTAMP");
  updateValues.push(habitId, user.id);

  await c.env.DB.prepare(
    `UPDATE habits SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`
  )
    .bind(...updateValues)
    .run();

  const updatedHabit = await c.env.DB.prepare(
    "SELECT * FROM habits WHERE id = ? AND user_id = ?"
  )
    .bind(habitId, user.id)
    .first();

  return c.json(updatedHabit);
});

app.delete('/api/habits/:id', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const habitId = c.req.param('id');
  
  await c.env.DB.prepare(
    "UPDATE habits SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
  )
    .bind(habitId, user.id)
    .run();

  return c.json({ success: true });
});

// Habit entries routes
app.get('/api/habit-entries', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const date = c.req.query('date') || format(new Date(), 'yyyy-MM-dd');
  
  const { results } = await c.env.DB.prepare(`
    SELECT he.*, h.name as habit_name, h.category, h.target_frequency
    FROM habit_entries he
    JOIN habits h ON he.habit_id = h.id
    WHERE he.user_id = ? AND he.date = ?
    ORDER BY h.created_at ASC
  `)
    .bind(user.id, date)
    .all();

  return c.json(results);
});

app.post('/api/habit-entries', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = CreateHabitEntrySchema.parse(body);
  
  // Check if entry already exists
  const existingEntry = await c.env.DB.prepare(
    "SELECT * FROM habit_entries WHERE user_id = ? AND habit_id = ? AND date = ?"
  )
    .bind(user.id, validatedData.habit_id, validatedData.date)
    .first();

  if (existingEntry) {
    // Update existing entry
    await c.env.DB.prepare(
      "UPDATE habit_entries SET completed = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(validatedData.completed, validatedData.notes || null, existingEntry.id)
      .run();

    const updatedEntry = await c.env.DB.prepare(
      "SELECT * FROM habit_entries WHERE id = ?"
    )
      .bind(existingEntry.id)
      .first();

    return c.json(updatedEntry);
  } else {
    // Create new entry
    const result = await c.env.DB.prepare(
      "INSERT INTO habit_entries (user_id, habit_id, date, completed, notes) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(user.id, validatedData.habit_id, validatedData.date, validatedData.completed, validatedData.notes || null)
      .run();

    const entry = await c.env.DB.prepare(
      "SELECT * FROM habit_entries WHERE id = ?"
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(entry, 201);
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Get total active habits
  const totalHabitsResult = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND is_active = 1"
  )
    .bind(user.id)
    .first();
  
  // Get completed today
  const completedTodayResult = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM habit_entries WHERE user_id = ? AND date = ? AND completed = 1"
  )
    .bind(user.id, today)
    .first();
  
  // Calculate current streak (simplified - consecutive days with at least one completed habit)
  let currentStreak = 0;
  let checkDate = new Date();
  
  while (currentStreak < 365) { // Max 365 days to prevent infinite loop
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const dayEntries = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM habit_entries WHERE user_id = ? AND date = ? AND completed = 1"
    )
      .bind(user.id, dateStr)
      .first();
    
    if ((dayEntries as any).count > 0) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  // Get weekly progress
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyProgress = await Promise.all(
    weekDays.map(async (day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const [totalResult, completedResult] = await Promise.all([
        c.env.DB.prepare(
          "SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND is_active = 1"
        ).bind(user.id).first(),
        c.env.DB.prepare(
          "SELECT COUNT(*) as count FROM habit_entries WHERE user_id = ? AND date = ? AND completed = 1"
        ).bind(user.id, dateStr).first()
      ]);
      
      return {
        date: dateStr,
        completed: (completedResult as any).count,
        total: (totalResult as any).count,
      };
    })
  );

  const stats = {
    totalHabits: (totalHabitsResult as any).count,
    completedToday: (completedTodayResult as any).count,
    currentStreak: currentStreak,
    longestStreak: currentStreak, // Simplified for now
    weeklyProgress: weeklyProgress,
  };

  return c.json(stats);
});

// AI Insights (Mock)
app.get('/api/ai/daily-insight', devAuthMiddleware, async (c) => {
  // Mock AI insights - replace with real AI later
  const insights = [
    {
      type: 'motivation' as const,
      message: "You're building momentum! Every small step counts toward your bigger goals.",
      priority: 'medium' as const,
    },
    {
      type: 'tip' as const,
      message: "Try habit stacking: attach a new habit to an existing one for better success.",
      priority: 'high' as const,
    },
    {
      type: 'celebration' as const,
      message: "Congratulations on maintaining your streak! Your consistency is paying off.",
      priority: 'high' as const,
    },
    {
      type: 'encouragement' as const,
      message: "Remember, progress isn't always linear. Keep going, you've got this!",
      priority: 'low' as const,
    },
  ];
  
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];
  
  return c.json(randomInsight);
});

// Journal routes
app.get('/api/journal', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC LIMIT 10"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post('/api/journal', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = CreateJournalEntrySchema.parse(body);
  
  let sentimentScore = 0;
  let aiFeedback = "Thank you for sharing your thoughts. Reflection is a powerful tool for personal growth.";
  
  try {
    // Get user's habits for context
    const { results: userHabits } = await c.env.DB.prepare(
      "SELECT name, category, description FROM habits WHERE user_id = ? AND is_active = 1"
    ).bind(user.id).all();

    // Only call OpenAI if API key is available
    if (c.env.OPENAI_API_KEY) {
      // Analyze journal entry with OpenAI
      const analysisPrompt = `You are a compassionate AI journal analyzer. Analyze this journal entry for:
1. Sentiment (return a score from -1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
2. Provide a brief, encouraging insight (2-3 sentences max)

Context about the user's current habits:
${userHabits.length > 0 ? userHabits.map((h: any) => `- ${h.name} (${h.category === 'good' ? 'building' : 'breaking'})${h.description ? ': ' + h.description : ''}`).join('\n') : 'No active habits set yet.'}

Journal entry: "${validatedData.content.replace(/"/g, '\\"')}"

Respond in this exact JSON format:
{
  "sentiment_score": [number between -1 and 1],
  "feedback": "[Your encouraging insight here]"
}`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a supportive AI journal analyzer that provides helpful insights and sentiment analysis. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
          response_format: { type: "json_object" }
        }),
      });

      if (openaiResponse.ok) {
        const openaiData: any = await openaiResponse.json();
        const analysisResult = JSON.parse(openaiData.choices[0]?.message?.content || '{}');
        
        if (analysisResult.sentiment_score !== undefined && analysisResult.feedback) {
          sentimentScore = Math.max(-1, Math.min(1, analysisResult.sentiment_score)); // Clamp between -1 and 1
          aiFeedback = analysisResult.feedback;
        }
      }
    }
  } catch (error) {
    console.error('OpenAI journal analysis error:', error);
    // Fall back to basic sentiment analysis
    const positiveWords = ['good', 'great', 'happy', 'excited', 'amazing', 'wonderful', 'love', 'joy', 'success', 'accomplished'];
    const negativeWords = ['bad', 'sad', 'angry', 'frustrated', 'difficult', 'hard', 'struggle', 'problem', 'worry', 'stress'];
    
    const text = validatedData.content.toLowerCase();
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentimentScore = 0.5;
      aiFeedback = "Your reflection shows positive energy! Keep nurturing those good thoughts and celebrating your progress.";
    } else if (negativeCount > positiveCount) {
      sentimentScore = -0.5;
      aiFeedback = "It sounds like you're facing some challenges. Remember that difficult moments are opportunities for growth and learning.";
    } else {
      sentimentScore = 0;
      aiFeedback = "Your honest reflection is valuable for your growth journey. Keep taking time to process your thoughts and experiences.";
    }
  }
  
  const result = await c.env.DB.prepare(
    "INSERT INTO journal_entries (user_id, date, content, sentiment_score, ai_feedback) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(user.id, validatedData.date, validatedData.content, sentimentScore, aiFeedback)
    .run();

  const entry = await c.env.DB.prepare(
    "SELECT * FROM journal_entries WHERE id = ?"
  )
    .bind(result.meta.last_row_id)
    .first();

  return c.json(entry, 201);
});

// AI Coach Chat
app.post('/api/ai/coach/chat', devAuthMiddleware, async (c) => {
  const body = await c.req.json();
  
  const { message, context, conversation_history } = body;
  
  try {
    // Check if OpenAI API key is available
    if (!c.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Build system prompt with user context
    let systemPrompt = `You are a supportive and knowledgeable AI habit coach named HabitFlow Coach. Your role is to help users build good habits and break bad ones through personalized strategies, motivation, and guidance.

Key principles:
- Be encouraging, empathetic, and supportive
- Provide specific, actionable advice
- Use evidence-based habit formation strategies
- Keep responses conversational and engaging (2-4 sentences max unless explaining a complex strategy)
- Reference the user's specific habits and journal insights when relevant
- Focus on small, sustainable changes rather than overwhelming transformations

`;

    if (context) {
      if (context.habits && context.habits.length > 0) {
        systemPrompt += "\nUser's current habits:\n";
        context.habits.forEach((habit: any) => {
          systemPrompt += `- ${habit.name} (${habit.category === 'good' ? 'building' : 'breaking'})${habit.description ? ': ' + habit.description : ''}\n`;
        });
      } else {
        systemPrompt += "\nThe user hasn't set up any habits yet.\n";
      }
      
      if (context.recentJournalEntries && context.recentJournalEntries.length > 0) {
        systemPrompt += "\nRecent journal insights:\n";
        context.recentJournalEntries.forEach((entry: any, index: number) => {
          if (index < 3) { // Limit to most recent 3 entries for context
            const sentiment = entry.sentiment_score > 0.3 ? 'positive' : entry.sentiment_score < -0.3 ? 'challenging' : 'mixed';
            const truncatedContent = entry.content.substring(0, 100).replace(/"/g, "'");
            const ellipsis = entry.content.length > 100 ? '...' : '';
            systemPrompt += `- ${entry.date}: ${sentiment} mood - "${truncatedContent}${ellipsis}"\n`;
          }
        });
      }
    }

    systemPrompt += "\nProvide helpful advice tailored to their specific situation. Be concise but thorough.";

    // Build conversation messages
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add recent conversation history (last 6 messages for context)
    if (conversation_history && conversation_history.length > 0) {
      const recentHistory = conversation_history.slice(-6);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData: any = await openaiResponse.json();
    const aiMessage = openaiData.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from OpenAI');
    }

    return c.json({ message: aiMessage });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to contextual mock response if OpenAI fails
    let fallbackResponse = "I'm experiencing some technical difficulties right now, but I'm here to help! ";
    
    if (context?.habits?.length === 0) {
      fallbackResponse += "Since you haven't set up any habits yet, I'd recommend starting with one small, specific habit. What area of your life would you like to improve first?";
    } else if (context?.habits?.some((h: any) => h.category === 'bad')) {
      fallbackResponse += "I see you're working on breaking some challenging habits. Remember, replacing a bad habit with a good one is often more effective than just trying to stop. What positive alternative could you try?";
    } else {
      fallbackResponse += "Based on your current habits, you're making great progress! What specific support or strategy would be most helpful for you right now?";
    }
    
    return c.json({ message: fallbackResponse });
  }
});

// Groups routes
app.get('/api/groups', devAuthMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM user_groups ORDER BY member_count DESC, name ASC"
  ).all();

  return c.json(results);
});

app.get('/api/groups/my', devAuthMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const { results } = await c.env.DB.prepare(`
    SELECT ug.*, gm.joined_at
    FROM user_groups ug
    JOIN group_members gm ON ug.id = gm.group_id
    WHERE gm.user_id = ?
    ORDER BY gm.joined_at DESC
  `)
    .bind(user.id)
    .all();

  return c.json(results);
});

export default app;
