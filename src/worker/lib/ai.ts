import { z } from 'zod';

export const AnalysisSchema = z.object({
  sentiment_score: z.number().min(-1).max(1),
  feedback: z.string().min(1).max(1500),
});
export function basicAnalysis(content: string) {
  const words = new Set(content.toLowerCase().match(/[a-z]+/g) ?? []);
  const positive = ['good', 'great', 'happy', 'excited', 'amazing', 'wonderful', 'love', 'joy', 'success', 'accomplished'].filter(word => words.has(word)).length;
  const negative = ['bad', 'sad', 'angry', 'frustrated', 'difficult', 'hard', 'struggle', 'problem', 'worry', 'stress'].filter(word => words.has(word)).length;
  return {
    sentiment_score: positive === negative ? 0 : positive > negative ? 0.5 : -0.5,
    feedback: positive > negative
      ? 'Notice what helped today and try one small repeatable step tomorrow.'
      : negative > positive
        ? 'Consider making your next step smaller and asking for support when you need it.'
        : 'Taking time to reflect is useful. Choose one small action for tomorrow.',
  };
}
const ResponseSchema = z.object({ choices: z.array(z.object({ message: z.object({ content: z.string().min(1) }) })).min(1) });
export async function requestCoach(key: string, messages: { role: 'system' | 'user' | 'assistant'; content: string }[], json = false) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: json ? 250 : 400, temperature: json ? 0.3 : 0.7, ...(json ? { response_format: { type: 'json_object' } } : {}) }),
  });
  if (!response.ok) throw new Error('AI provider is unavailable');
  return ResponseSchema.parse(await response.json()).choices[0].message.content;
}
