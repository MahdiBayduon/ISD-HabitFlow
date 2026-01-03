import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, Target, BookOpen } from "lucide-react";
import { apiRequest } from "@/react-app/hooks/useApi";
import Card from "@/react-app/components/Card";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICoachContext {
  habits: Array<{
    id: number;
    name: string;
    category: 'good' | 'bad';
    description?: string;
  }>;
  recentJournalEntries: Array<{
    date: string;
    content: string;
    sentiment_score?: number;
  }>;
}

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AICoachContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContext();
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchContext = async () => {
    try {
      const [habits, journalEntries] = await Promise.all([
        apiRequest('/api/habits'),
        apiRequest('/api/journal')
      ]);

      setContext({
        habits: (habits as any[]).map((h: any) => ({
          id: h.id,
          name: h.name,
          category: h.category,
          description: h.description
        })),
        recentJournalEntries: (journalEntries as any[]).slice(0, 5).map((j: any) => ({
          date: j.date,
          content: j.content,
          sentiment_score: j.sentiment_score
        }))
      });
    } catch (error) {
      console.error('Failed to fetch context:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Habit Coach. I'm here to help you build positive habits and break negative ones with personalized strategies. I have access to your habits and journal entries to provide tailored guidance. What would you like to work on today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/ai/coach/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: inputMessage.trim(),
          context: context,
          conversation_history: messages.slice(-10) // Last 10 messages for context
        })
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (response as any).message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Coach</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Get personalized strategies and guidance for building better habits
        </p>
      </div>

      {/* Context Cards */}
      {context && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Habits</h3>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {context.habits.map(habit => (
                <div key={habit.id} className="flex items-center text-sm">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    habit.category === 'good' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-gray-700 dark:text-gray-300">{habit.name}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center mb-2">
              <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Journal Insights</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {context.recentJournalEntries.length > 0 
                ? `${context.recentJournalEntries.length} recent entries analyzed`
                : "No journal entries yet"
              }
            </p>
          </Card>
        </div>
      )}

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI coach for habit strategies, motivation, or guidance..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
