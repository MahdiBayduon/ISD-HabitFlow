import { useAuth } from '@getmocha/users-service/react';
import { useTheme } from '@/react-app/hooks/useTheme';
import Card from '@/react-app/components/Card';

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  return <div className="p-6 space-y-6 max-w-4xl">
    <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-gray-600 dark:text-gray-300 mt-2">Your account and appearance preferences.</p></div>
    <Card className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h2><p className="text-gray-900 dark:text-white">{user?.google_user_data?.name || 'User'}</p><p className="text-gray-600 dark:text-gray-300">{user?.email}</p><p className="text-sm text-gray-500 mt-4">Profile information is supplied by your sign-in provider.</p></Card>
    <Card className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2><label className="flex items-center gap-3 text-gray-900 dark:text-white"><input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} className="w-5 h-5" />Use dark mode</label><p className="text-sm text-gray-500 mt-3">Saved on this browser.</p></Card>
    <Card className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data & AI</h2><p className="text-gray-600 dark:text-gray-300">Habit check-ins use UTC. The journal shows your latest ten reflections. If AI is configured, journal text and habit context are sent to OpenAI for analysis and coaching. Chat history lasts only for the current screen session.</p><p className="text-sm text-gray-500 mt-4">Notification scheduling, profile editing, data export and account deletion are planned features.</p></Card>
  </div>;
}
