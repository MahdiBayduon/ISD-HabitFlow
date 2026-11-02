import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProgress, shiftDate } from '../.test-build/progress.mjs';

test('streak survives until today ends and longest streak is independent', () => {
  const stats = calculateProgress('2026-11-03', 2, ['2026-10-01','2026-10-02','2026-10-03','2026-11-01','2026-11-02']);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.longestStreak, 3);
  assert.equal(stats.completedToday, 0);
});
test('same-day completions count separately but add one streak day', () => {
  const stats = calculateProgress('2026-11-03', 2, ['2026-11-02','2026-11-03','2026-11-03','2027-01-01']);
  assert.equal(stats.completedToday, 2);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.weeklyProgress[0].date, '2026-11-02');
});
test('empty and broken streaks are zero and UTC arithmetic crosses year boundaries', () => {
  assert.equal(calculateProgress('2026-11-03', 0, []).currentStreak, 0);
  assert.equal(calculateProgress('2026-11-03', 1, ['2026-11-01']).currentStreak, 0);
  assert.equal(shiftDate('2026-01-01', -1), '2025-12-31');
});
