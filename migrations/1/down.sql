
DROP INDEX idx_challenge_participants_challenge_id;
DROP INDEX idx_challenge_participants_user_id;
DROP INDEX idx_group_members_group_id;
DROP INDEX idx_group_members_user_id;
DROP INDEX idx_journal_entries_date;
DROP INDEX idx_journal_entries_user_id;
DROP INDEX idx_habit_entries_date;
DROP INDEX idx_habit_entries_habit_id;
DROP INDEX idx_habit_entries_user_id;
DROP INDEX idx_habits_user_id;

DROP TABLE challenge_participants;
DROP TABLE challenges;
DROP TABLE group_members;
DROP TABLE user_groups;
DROP TABLE journal_entries;
DROP TABLE habit_entries;
DROP TABLE habits;
