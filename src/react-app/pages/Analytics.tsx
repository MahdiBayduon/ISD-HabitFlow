import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Target, Zap } from "lucide-react";
import { useApi, apiRequest } from "@/react-app/hooks/useApi";
import Card from "@/react-app/components/Card";
import StatCard from "@/react-app/components/StatCard";
import type { DashboardStats, Habit, HabitEntry } from "@/shared/types";

export default function Analytics() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [, setHabits] = useState<Habit[]>([]);
  const [aiPrediction, setAiPrediction] = useState<string>("");

  const { data: stats } = useApi<DashboardStats>('/api/dashboard/stats');

  useEffect(() => {
    fetchAnalyticsData();
    generateAIPrediction();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [habitsData] = await Promise.all([
        apiRequest<Habit[]>('/api/habits'),
      ]);
      
      setHabits(habitsData);

      // Generate monthly completion data
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const monthlyEntries = await Promise.all(
        monthDays.map(async (day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          try {
            const entries = await apiRequest<(HabitEntry & { habit_name: string })[]>(`/api/habit-entries?date=${dateStr}`);
            const completed = entries.filter(e => e.completed).length;
            return {
              date: format(day, 'MMM d'),
              completed,
              total: habitsData.length,
              day: format(day, 'd'),
            };
          } catch {
            return {
              date: format(day, 'MMM d'),
              completed: 0,
              total: habitsData.length,
              day: format(day, 'd'),
            };
          }
        })
      );

      setMonthlyData(monthlyEntries);

      // Generate category breakdown
      const goodHabits = habitsData.filter(h => h.category === 'good').length;
      const badHabits = habitsData.filter(h => h.category === 'bad').length;
      
      setCategoryData([
        { name: 'Good Habits', value: goodHabits, color: '#10b981' },
        { name: 'Bad Habits', value: badHabits, color: '#ef4444' },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  const generateAIPrediction = () => {
    // Mock AI prediction
    const predictions = [
      "Based on your current consistency, you have a 85% chance of maintaining your streak for the next 7 days. Keep up the excellent work!",
      "Your morning habits show strong adherence. Consider adding an evening routine to boost overall completion rates by 23%.",
      "Data suggests you're most successful on weekdays. Try implementing weekend-specific strategies to improve consistency.",
      "Your habit completion rate has improved 32% this month. You're on track to exceed your monthly goals!",
    ];
    
    setAiPrediction(predictions[Math.floor(Math.random() * predictions.length)]);
  };

  const completionRate = stats ? Math.round((stats.completedToday / Math.max(stats.totalHabits, 1)) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Progress</h1>
        <p className="text-gray-600">Track your habit performance and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={Target}
          color="blue"
          subtitle="today"
        />
        <StatCard
          title="Current Streak"
          value={stats?.currentStreak || 0}
          icon={TrendingUp}
          color="green"
          subtitle="days"
        />
        <StatCard
          title="This Month"
          value={monthlyData.reduce((acc, day) => acc + day.completed, 0)}
          icon={Calendar}
          color="purple"
          subtitle="completions"
        />
        <StatCard
          title="Active Habits"
          value={stats?.totalHabits || 0}
          icon={Zap}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Progress Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Monthly Progress</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Prediction */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Prediction</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100">
              <p className="text-sm text-gray-800 leading-relaxed">{aiPrediction}</p>
            </div>
          </Card>

          {/* Habit Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Habit Categories</h2>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No habits to analyze yet</p>
            )}
          </Card>
        </div>
      </div>

      {/* Weekly Trend */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Weekly Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.weeklyProgress || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(date) => format(new Date(date), 'EEE')}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(date) => format(new Date(date), 'EEEE, MMM d')}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
