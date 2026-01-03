import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Target, TrendingUp, Flame, Calendar, Plus, CheckCircle, Circle } from "lucide-react";
import { useApi, apiRequest } from "@/react-app/hooks/useApi";
import Card from "@/react-app/components/Card";
import StatCard from "@/react-app/components/StatCard";
import type { DashboardStats, Habit, HabitEntry, AIInsight } from "@/shared/types";

export default function Dashboard() {
  const [todayEntries, setTodayEntries] = useState<(HabitEntry & { habit_name: string; category: string })[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: stats, loading: statsLoading } = useApi<DashboardStats>('/api/dashboard/stats');
  const { data: aiInsight, loading: insightLoading } = useApi<AIInsight>('/api/ai/daily-insight');
  
  useEffect(() => {
    fetchHabits();
    fetchTodayEntries();
  }, []);

  const fetchHabits = async () => {
    try {
      const data = await apiRequest<Habit[]>('/api/habits');
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    }
  };

  const fetchTodayEntries = async () => {
    try {
      const data = await apiRequest<(HabitEntry & { habit_name: string; category: string })[]>(`/api/habit-entries?date=${today}`);
      setTodayEntries(data);
    } catch (error) {
      console.error('Failed to fetch today entries:', error);
    }
  };

  const toggleHabit = async (habitId: number, completed: boolean) => {
    try {
      await apiRequest('/api/habit-entries', {
        method: 'POST',
        body: JSON.stringify({
          habit_id: habitId,
          date: today,
          completed: !completed,
        }),
      });
      fetchTodayEntries();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const getHabitCompletion = (habitId: number) => {
    const entry = todayEntries.find(e => e.habit_id === habitId);
    return entry?.completed || false;
  };

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="flex justify-center mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        <StatCard
          title="Total Habits"
          value={stats?.totalHabits || 0}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={`${stats?.completedToday || 0}/${stats?.totalHabits || 0}`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Current Streak"
          value={stats?.currentStreak || 0}
          icon={Flame}
          color="orange"
          subtitle="days"
        />
        <StatCard
          title="This Week"
          value={`${stats?.weeklyProgress?.reduce((acc, day) => acc + day.completed, 0) || 0}/${(stats?.weeklyProgress?.length || 0) * (stats?.totalHabits || 0)}`}
          icon={TrendingUp}
          color="purple"
        />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Habits</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(), 'MMM d')}
              </div>
            </div>
            
            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No habits yet. Start building good habits today!</p>
                  <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Habit
                  </button>
                </div>
              ) : (
                habits.map((habit) => {
                  const isCompleted = getHabitCompletion(habit.id);
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isCompleted
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleHabit(habit.id, isCompleted)}
                    >
                      <div className="mr-4">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${isCompleted ? "text-green-900 line-through" : "text-gray-900"}`}>
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        habit.category === 'good' 
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {habit.category === 'good' ? 'Good' : 'Break'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* AI Insight */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Daily Insight</h2>
            {insightLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : aiInsight ? (
              <div className={`p-4 rounded-xl ${
                aiInsight.type === 'celebration' ? 'bg-green-50 border-green-200' :
                aiInsight.type === 'motivation' ? 'bg-blue-50 border-blue-200' :
                aiInsight.type === 'tip' ? 'bg-purple-50 border-purple-200' :
                'bg-yellow-50 border-yellow-200'
              } border-2`}>
                <p className="text-sm text-gray-800 leading-relaxed">{aiInsight.message}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No insights available</p>
            )}
          </Card>

          {/* Weekly Progress */}
          {stats?.weeklyProgress && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weekly Progress</h2>
              <div className="space-y-3">
                {stats.weeklyProgress.map((day, index) => {
                  const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{format(new Date(day.date), 'EEE')}</span>
                        <span className="text-gray-900 dark:text-white">{day.completed}/{day.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
