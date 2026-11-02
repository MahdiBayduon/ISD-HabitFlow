import { Users, Target, Trophy } from 'lucide-react';
import Card from '@/react-app/components/Card';

export default function Community() {
  return <div className="p-6 space-y-6">
    <div><p className="text-sm font-semibold text-indigo-600 mb-2">Planned feature</p><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1><p className="text-gray-600 dark:text-gray-300 mt-2">A preview of the next stage of HabitFlow. Group participation and leaderboards are not available yet.</p></div>
    <div className="grid gap-6 md:grid-cols-3">{[
      { Icon: Users, title: 'Accountability Groups', description: 'Connect around routines such as reading, movement, or mindfulness.' },
      { Icon: Target, title: 'Shared Challenges', description: 'Work toward a small daily goal together for a defined period.' },
      { Icon: Trophy, title: 'Progress Celebrations', description: 'Recognize consistency with privacy controls and opt-in participation.' },
    ].map(({Icon,title,description}) => <Card key={title} className="p-6"><Icon className="w-8 h-8 text-indigo-500 mb-4" /><h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2><p className="text-gray-600 dark:text-gray-300 mt-2">{description}</p><p className="text-xs text-gray-500 mt-4">On the roadmap</p></Card>)}</div>
  </div>;
}
