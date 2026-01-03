import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Target, Flame } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

// Mock data for demo
const weeklyData = [
  { name: 'Mon', completed: 4, total: 5 },
  { name: 'Tue', completed: 5, total: 5 },
  { name: 'Wed', completed: 3, total: 5 },
  { name: 'Thu', completed: 4, total: 5 },
  { name: 'Fri', completed: 5, total: 5 },
  { name: 'Sat', completed: 3, total: 5 },
  { name: 'Sun', completed: 4, total: 5 },
];

const monthlyData = [
  { name: 'Week 1', streak: 7, habits: 12 },
  { name: 'Week 2', streak: 14, habits: 18 },
  { name: 'Week 3', streak: 8, habits: 15 },
  { name: 'Week 4', streak: 21, habits: 22 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track your progress and insights</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completion Rate"
          value="84%"
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={21}
          icon={Flame}
          color="orange"
          subtitle="days"
        />
        <StatCard
          title="Best Streak"
          value={45}
          icon={TrendingUp}
          color="green"
          subtitle="days"
        />
        <StatCard
          title="Active Habits"
          value={5}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Weekly Completion</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'completed' ? 'Completed' : 'Total']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Bar dataKey="total" fill="#e5e7eb" name="total" />
              <Bar dataKey="completed" fill="url(#gradient)" name="completed" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Progress Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Monthly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="streak" stroke="#f59e0b" strokeWidth={3} />
              <Line type="monotone" dataKey="habits" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Habit Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Habit Performance</h2>
        <div className="space-y-4">
          {[
            { name: "Morning Exercise", completion: 92, streak: 12, category: "good" },
            { name: "Meditation", completion: 88, streak: 8, category: "good" },
            { name: "Reading", completion: 76, streak: 5, category: "good" },
            { name: "Reduce Social Media", completion: 65, streak: 3, category: "bad" },
            { name: "Drink Water", completion: 94, streak: 15, category: "good" },
          ].map((habit, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  habit.category === 'good' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{habit.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{habit.streak} day streak</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{habit.completion}%</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${habit.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
