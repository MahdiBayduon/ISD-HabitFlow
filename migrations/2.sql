-- Keep the latest row for a daily check-in before adding uniqueness.
DELETE FROM habit_entries WHERE id NOT IN (
  SELECT MAX(id) FROM habit_entries GROUP BY user_id, habit_id, date
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_habit_entries_daily ON habit_entries(user_id, habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_date ON habit_entries(user_id, date, completed);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);

ALTER TABLE journal_entries ADD COLUMN analysis_source TEXT NOT NULL DEFAULT 'basic';

-- The submitted version has one boolean check-in per habit per day.
UPDATE habits SET target_frequency = 1;
