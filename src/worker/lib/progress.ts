/** Daily tracking uses UTC consistently across the client, API and database. */
export const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);
export const shiftDate = (day: string, amount: number) =>
  dateKey(new Date(Date.parse(`${day}T00:00:00Z`) + amount * 86_400_000));

export function calculateProgress(today: string, totalHabits: number, completedDates: string[]) {
  const counts = new Map<string, number>();
  for (const day of completedDates) {
    if (day <= today) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const dates = [...counts.keys()].sort();
  let longestStreak = 0;
  let run = 0;
  let previous = '';
  for (const day of dates) {
    run = previous && shiftDate(previous, 1) === day ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = day;
  }
  let currentStreak = 0;
  let cursor = counts.has(today) ? today : shiftDate(today, -1);
  while (counts.has(cursor)) {
    currentStreak++;
    cursor = shiftDate(cursor, -1);
  }
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const monday = shiftDate(today, -((weekday + 6) % 7));
  return {
    totalHabits,
    completedToday: counts.get(today) ?? 0,
    currentStreak,
    longestStreak,
    weeklyProgress: Array.from({ length: 7 }, (_, index) => {
      const date = shiftDate(monday, index);
      return { date, completed: counts.get(date) ?? 0, total: totalHabits };
    }),
  };
}
