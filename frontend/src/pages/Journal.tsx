import { useState, useEffect } from 'react';
import { Plus, Calendar, MessageCircle, Sparkles } from 'lucide-react';
import { apiRequest } from '../hooks/useApi';
import Card from '../components/Card';
import type { JournalEntry } from '../types';

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await apiRequest<JournalEntry[]>('/journal');
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await apiRequest('/journal', {
        method: 'POST',
        body: JSON.stringify({
          date: selectedDate,
          content: content.trim(),
        }),
      });
      
      setContent('');
      setIsWriting(false);
      fetchEntries();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score > 0.3) return 'bg-green-100 text-green-700';
    if (score < -0.3) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getSentimentText = (score?: number) => {
    if (!score) return 'Neutral';
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Mixed';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journal</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Reflect on your progress and thoughts</p>
        </div>
        <button
          onClick={() => setIsWriting(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </button>
      </div>

      {/* Writing Form */}
      {isWriting && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Write Journal Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your thoughts
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="How are you feeling today? What happened? Any reflections on your habits..."
                rows={8}
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false);
                  setContent('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Save Entry
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No journal entries yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start reflecting on your journey today!</p>
            <button
              onClick={() => setIsWriting(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Entry
            </button>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">{new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}</span>
                  </div>
                  {entry.sentiment_score !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(entry.sentiment_score)}`}>
                      {getSentimentText(entry.sentiment_score)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {entry.content}
                </p>
              </div>
              
              {entry.ai_feedback && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start">
                    <Sparkles className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">AI Insight</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{entry.ai_feedback}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
