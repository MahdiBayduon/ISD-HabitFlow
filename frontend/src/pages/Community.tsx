import { useState, useEffect } from 'react';
import { Users, Trophy, Plus, Calendar, Target } from 'lucide-react';
import { apiRequest } from '../hooks/useApi';
import Card from '../components/Card';
import type { UserGroup, Challenge } from '../types';

export default function Community() {
  const [activeTab, setActiveTab] = useState<'groups' | 'challenges'>('groups');
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchChallenges();
  }, []);

  const fetchGroups = async () => {
    try {
      // Mock data since we don't have real API endpoints yet
      setGroups([
        {
          id: 1,
          name: "Morning Risers",
          description: "Early birds building morning routines together",
          category: "fitness",
          member_count: 247,
          created_at: "2024-01-15T00:00:00Z",
          updated_at: "2024-01-15T00:00:00Z"
        },
        {
          id: 2,
          name: "Reading Club",
          description: "Book lovers reading 30 minutes daily",
          category: "reading",
          member_count: 189,
          created_at: "2024-01-10T00:00:00Z",
          updated_at: "2024-01-10T00:00:00Z"
        },
        {
          id: 3,
          name: "Mindful Meditators",
          description: "Daily meditation practice community",
          category: "meditation",
          member_count: 156,
          created_at: "2024-01-12T00:00:00Z",
          updated_at: "2024-01-12T00:00:00Z"
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      // Mock data
      setChallenges([
        {
          id: 1,
          group_id: 1,
          name: "30-Day Early Rising Challenge",
          description: "Wake up before 6 AM for 30 consecutive days",
          start_date: "2024-11-01",
          end_date: "2024-11-30",
          is_active: true,
          created_at: "2024-10-25T00:00:00Z",
          updated_at: "2024-10-25T00:00:00Z"
        },
        {
          id: 2,
          group_id: 2,
          name: "November Reading Marathon",
          description: "Read for at least 30 minutes every day this month",
          start_date: "2024-11-01",
          end_date: "2024-11-30",
          is_active: true,
          created_at: "2024-10-28T00:00:00Z",
          updated_at: "2024-10-28T00:00:00Z"
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const joinGroup = async (groupId: number) => {
    try {
      // Mock join functionality
      console.log(`Joining group ${groupId}`);
      alert('Joined group successfully!');
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const joinChallenge = async (challengeId: number) => {
    try {
      // Mock join functionality
      console.log(`Joining challenge ${challengeId}`);
      alert('Joined challenge successfully!');
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Connect with others and join challenges</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'groups'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Challenges
          </button>
        </div>
      </div>

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-blue-100 text-blue-800">
                      {group.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{group.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {group.member_count} members
                </span>
                <button
                  onClick={() => joinGroup(group.id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Join
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenges.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active challenges</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back later for new challenges!</p>
            </Card>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{challenge.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          challenge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {challenge.is_active ? 'Active' : 'Ended'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">15/30 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: '50%' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      Join Challenge
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
