import z from "zod";

// Habit types
export const HabitSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.enum(['good', 'bad']),
  target_frequency: z.number().default(1),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional(),
  category: z.enum(['good', 'bad']),
  target_frequency: z.number().min(1).max(10).default(1),
});

export const UpdateHabitSchema = CreateHabitSchema.partial();

// Habit Entry types
export const HabitEntrySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  habit_id: z.number(),
  date: z.string(),
  completed: z.boolean().default(false),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateHabitEntrySchema = z.object({
  habit_id: z.number(),
  date: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
});

// Journal Entry types
export const JournalEntrySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  date: z.string(),
  content: z.string(),
  sentiment_score: z.number().nullable(),
  ai_feedback: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateJournalEntrySchema = z.object({
  date: z.string(),
  content: z.string().min(1, "Journal content is required"),
});

// Group types
export const UserGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  member_count: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GroupMemberSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  group_id: z.number(),
  joined_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Challenge types
export const ChallengeSchema = z.object({
  id: z.number(),
  group_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ChallengeParticipantSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  challenge_id: z.number(),
  progress: z.number().default(0),
  completed: z.boolean().default(false),
  joined_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// API Response types
export const DashboardStatsSchema = z.object({
  totalHabits: z.number(),
  completedToday: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  weeklyProgress: z.array(z.object({
    date: z.string(),
    completed: z.number(),
    total: z.number(),
  })),
});

export const AIInsightSchema = z.object({
  type: z.enum(['motivation', 'tip', 'celebration', 'encouragement']),
  message: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
});

// Type exports
export type Habit = z.infer<typeof HabitSchema>;
export type CreateHabit = z.infer<typeof CreateHabitSchema>;
export type UpdateHabit = z.infer<typeof UpdateHabitSchema>;
export type HabitEntry = z.infer<typeof HabitEntrySchema>;
export type CreateHabitEntry = z.infer<typeof CreateHabitEntrySchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type CreateJournalEntry = z.infer<typeof CreateJournalEntrySchema>;
export type UserGroup = z.infer<typeof UserGroupSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type ChallengeParticipant = z.infer<typeof ChallengeParticipantSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type AIInsight = z.infer<typeof AIInsightSchema>;
