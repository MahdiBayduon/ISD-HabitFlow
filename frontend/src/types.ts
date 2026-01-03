export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Habit {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  category: 'good' | 'bad';
  target_frequency: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: number;
  user_id: string;
  habit_id: number;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  user_id: string;
  date: string;
  content: string;
  sentiment_score?: number;
  ai_feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  weeklyProgress: {
    date: string;
    completed: number;
    total: number;
  }[];
}

export interface AIInsight {
  id: string;
  type: 'motivation' | 'tip' | 'celebration' | 'warning';
  message: string;
  created_at: string;
}

export interface Challenge {
  id: number;
  group_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  id: number;
  name: string;
  description?: string;
  category: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}
