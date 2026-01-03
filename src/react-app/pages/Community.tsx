import { useState, useEffect } from "react";
import { Users, Trophy, Star, Calendar, Target } from "lucide-react";
import { useApi } from "@/react-app/hooks/useApi";
import Card from "@/react-app/components/Card";
import type { UserGroup } from "@/shared/types";

interface LeaderboardEntry {
  user: string;
  streak: number;
  completions: number;
  avatar: string;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  participants: number;
  duration: string;
  category: string;
}

export default function Community() {
  const [selectedTab, setSelectedTab] = useState<'groups' | 'challenges' | 'leaderboard'>('groups');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const { data: groups, loading: groupsLoading } = useApi<UserGroup[]>('/api/groups');
  const { data: myGroups, loading: myGroupsLoading } = useApi<UserGroup[]>('/api/groups/my');

  useEffect(() => {
    // Mock leaderboard data
    setLeaderboard([
      { user: "Alex Chen", streak: 45, completions: 234, avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=3b82f6&color=fff" },
      { user: "Sarah Wilson", streak: 38, completions: 201, avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=10b981&color=fff" },
      { user: "Mike Johnson", streak: 32, completions: 189, avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=8b5cf6&color=fff" },
      { user: "Emma Davis", streak: 28, completions: 167, avatar: "https://ui-avatars.com/api/?name=Emma+Davis&background=f59e0b&color=fff" },
      { user: "David Lee", streak: 25, completions: 156, avatar: "https://ui-avatars.com/api/?name=David+Lee&background=ef4444&color=fff" },
    ]);

    // Mock challenges data
    setChallenges([
      {
        id: 1,
        name: "7-Day Meditation Challenge",
        description: "Meditate for at least 10 minutes every day for a week",
        participants: 234,
        duration: "7 days",
        category: "Mindfulness"
      },
      {
        id: 2,
        name: "30-Day Fitness Journey",
        description: "Complete 30 minutes of exercise daily for a month",
        participants: 187,
        duration: "30 days",
        category: "Fitness"
      },
      {
        id: 3,
        name: "Reading Marathon",
        description: "Read for 30 minutes every day this month",
        participants: 156,
        duration: "30 days",
        category: "Learning"
      },
      {
        id: 4,
        name: "Hydration Hero",
        description: "Drink 8 glasses of water daily for 2 weeks",
        participants: 298,
        duration: "14 days",
        category: "Health"
      },
    ]);
  }, []);

  const tabs = [
    { id: 'groups', name: 'Groups', icon: Users },
    { id: 'challenges', name: 'Challenges', icon: Target },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
        <p className="text-gray-600">Connect with others and stay motivated together</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Groups Tab */}
      {selectedTab === 'groups' && (
        <div className="space-y-6">
          {/* My Groups */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Groups</h2>
            {myGroupsLoading ? (
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : myGroups && myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <Card key={group.id} className="p-6" hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        Member
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{group.member_count} members</span>
                      <span className="text-gray-500">{group.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No groups joined yet</h3>
                <p className="text-gray-500">Join a group below to connect with like-minded people</p>
              </Card>
            )}
          </div>

          {/* All Groups */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Discover Groups</h2>
            {groupsLoading ? (
              <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups?.map((group) => (
                  <Card key={group.id} className="p-6" hover>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <button className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-blue-700 transition-colors">
                        Join
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{group.member_count} members</span>
                      <span className="text-gray-500">{group.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {selectedTab === 'challenges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-6" hover>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{challenge.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {challenge.participants} participants
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {challenge.duration}
                      </span>
                    </div>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    {challenge.category}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                  Join Challenge
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top Performers This Month</h2>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-xl transition-colors ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200' :
                    'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {index === 0 ? <Trophy className="w-4 h-4" /> : index + 1}
                    </div>
                  </div>
                  
                  <img
                    src={entry.avatar}
                    alt={entry.user}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{entry.user}</h3>
                    <p className="text-sm text-gray-500">
                      {entry.completions} completions
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center text-orange-600">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{entry.streak}</span>
                    </div>
                    <p className="text-xs text-gray-500">day streak</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
