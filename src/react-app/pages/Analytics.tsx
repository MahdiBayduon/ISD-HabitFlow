import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Target, Flame } from 'lucide-react';
import { useApi } from '@/react-app/hooks/useApi';
import Card from '@/react-app/components/Card';
import StatCard from '@/react-app/components/StatCard';
import type { DashboardStats } from '@/shared/types';

export default function Analytics() {
  const { data: stats, error: statsError } = useApi<DashboardStats>('/api/dashboard/stats');
  const { data: monthly, loading, error } = useApi<{ date: string; day: string; completed: number }[]>('/api/analytics/monthly');
  const completionRate = stats?.totalHabits ? Math.round(stats.completedToday / stats.totalHabits * 100) : 0;
  return <div className="p-6 space-y-6">
    <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Progress</h1><p className="text-gray-600 dark:text-gray-300 mt-2">Real completion data for your active habits. Daily boundaries use UTC.</p></div>
    {(error || statsError) && <p role="alert" className="text-red-700">{error || statsError}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Completed Today" value={`${completionRate}%`} icon={Target} color="blue" />
      <StatCard title="Current Streak" value={stats?.currentStreak ?? 0} icon={Flame} color="orange" subtitle="days" />
      <StatCard title="Longest Streak" value={stats?.longestStreak ?? 0} icon={TrendingUp} color="green" subtitle="days" />
      <StatCard title="This Month" value={monthly?.reduce((sum, day) => sum + day.completed, 0) ?? 0} icon={Calendar} color="purple" subtitle="check-ins" />
    </div>
    <Card className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Daily Check-ins This Month</h2>
      {loading ? <p role="status">Loading your progress…</p> : <div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="completed" fill="#6366f1" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>}
    </Card>
    <Card className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">This Week</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={stats?.weeklyProgress ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={date => String(date).slice(5)} /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Card>
    <p className="text-sm text-gray-500">A streak is a sequence of days with at least one check-in on an active habit. Yesterday’s streak remains current until today ends. Archiving a habit excludes its entries from these charts and streaks.</p>
  </div>;
}
