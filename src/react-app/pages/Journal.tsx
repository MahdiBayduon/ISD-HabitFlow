import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BookOpen, Calendar, Sparkles, Heart, Frown, Meh } from "lucide-react";
import { apiRequest } from "@/react-app/hooks/useApi";
import Card from "@/react-app/components/Card";
import type { JournalEntry, CreateJournalEntry } from "@/shared/types";

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await apiRequest<JournalEntry[]>('/api/journal');
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry.trim()) return;

    setIsSubmitting(true);
    
    try {
      const entryData: CreateJournalEntry = {
        date: selectedDate,
        content: currentEntry.trim(),
      };

      await apiRequest('/api/journal', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });

      setCurrentEntry("");
      fetchEntries();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentIcon = (score: number | null) => {
    if (score === null) return <Meh className="w-5 h-5 text-gray-400" />;
    if (score > 0.3) return <Heart className="w-5 h-5 text-green-500" />;
    if (score < -0.3) return <Frown className="w-5 h-5 text-red-500" />;
    return <Meh className="w-5 h-5 text-yellow-500" />;
  };

  const getSentimentColor = (score: number | null) => {
    if (score === null) return "bg-gray-50 border-gray-200";
    if (score > 0.3) return "bg-green-50 border-green-200";
    if (score < -0.3) return "bg-red-50 border-red-200";
    return "bg-yellow-50 border-yellow-200";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daily Reflection</h1>
        <p className="text-gray-600">Track your thoughts and get AI-powered insights</p>
      </div>

      {/* New Entry Form */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Write Today's Entry
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was your day? What are you thinking about?
            </label>
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Share your thoughts, feelings, challenges, or victories from today..."
              rows={6}
              required
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              ✨ Our AI will analyze your entry and provide personalized feedback
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !currentEntry.trim()}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Save & Analyze
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Previous Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Previous Entries</h2>
        
        {entries.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-500 mb-6">Start journaling to track your thoughts and get AI insights</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {getSentimentIcon(entry.sentiment_score)}
                  </div>
                </div>
                
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
                
                {entry.ai_feedback && (
                  <div className={`rounded-xl p-4 border-2 ${getSentimentColor(entry.sentiment_score)}`}>
                    <div className="flex items-start">
                      <Sparkles className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">AI Insight</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {entry.ai_feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Written on {format(new Date(entry.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
