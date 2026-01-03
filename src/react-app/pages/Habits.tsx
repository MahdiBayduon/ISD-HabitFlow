import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Target, TrendingDown, Sparkles } from "lucide-react";
import { apiRequest } from "@/react-app/hooks/useApi";
import Card from "@/react-app/components/Card";
import type { Habit } from "@/shared/types";

interface HabitFormData {
  name: string;
  description: string;
  category: 'good' | 'bad';
  target_frequency: number;
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    category: 'good',
    target_frequency: 1,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const data = await apiRequest<Habit[]>('/api/habits');
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingHabit) {
        await apiRequest(`/api/habits/${editingHabit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest('/api/habits', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      
      resetForm();
      fetchHabits();
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await apiRequest(`/api/habits/${id}`, { method: 'DELETE' });
      fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      target_frequency: habit.target_frequency,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'good',
      target_frequency: 1,
    });
    setEditingHabit(null);
    setIsFormOpen(false);
  };

  const generateHabitPlan = async () => {
    setIsGenerating(true);
    
    // Mock AI habit plan generation
    const suggestions = [
      { name: "Morning Meditation", description: "5 minutes of mindfulness", category: 'good' as const },
      { name: "Daily Reading", description: "Read for 20 minutes", category: 'good' as const },
      { name: "Exercise", description: "30 minutes of physical activity", category: 'good' as const },
      { name: "Reduce Social Media", description: "Limit scrolling time", category: 'bad' as const },
      { name: "Drink More Water", description: "8 glasses per day", category: 'good' as const },
    ];
    
    setTimeout(() => {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setFormData({
        ...randomSuggestion,
        target_frequency: 1,
      });
      setIsFormOpen(true);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Habits</h1>
          <p className="text-gray-600 mt-1">Create, edit, and organize your habits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateHabitPlan}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'AI Suggest'}
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </button>
        </div>
      </div>

      {/* Habit Form */}
      {isFormOpen && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingHabit ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Morning workout"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'good' | 'bad' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="good">Good Habit (Build)</option>
                  <option value="bad">Bad Habit (Break)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Frequency (times per day)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.target_frequency}
                onChange={(e) => setFormData({ ...formData, target_frequency: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                {editingHabit ? 'Update' : 'Create'} Habit
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-6">Start building better habits today!</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Habit
              </button>
            </Card>
          </div>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id} className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                    habit.category === 'good' 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {habit.category === 'good' ? <Target className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      habit.category === 'good' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {habit.category === 'good' ? 'Good Habit' : 'Break Habit'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {habit.description && (
                <p className="text-gray-600 text-sm mb-4">{habit.description}</p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Target: {habit.target_frequency}x daily</span>
                <span>Created {new Date(habit.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
