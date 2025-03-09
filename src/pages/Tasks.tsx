import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Flag, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Task } from '../lib/supabase';

const Tasks: React.FC = () => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [activeTab, setActiveTab] = useState<'short-term' | 'long-term'>('short-term');
  const [editingTodo, setEditingTodo] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user's ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchTodos();
      }
    });
  }, [activeTab]);

  async function fetchTodos() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('category', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      toast.error('Error loading tasks');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !userId) return;
    
    try {
      if (editingTodo) {
        const { error } = await supabase
          .from('tasks')
          .update({
            text: newTodo.trim(),
            priority
          })
          .eq('id', editingTodo.id)
          .eq('user_id', userId);

        if (error) throw error;
        toast.success('Task updated successfully');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({
            text: newTodo.trim(),
            priority,
            category: activeTab,
            due_date: new Date().toISOString().split('T')[0],
            user_id: userId
          });

        if (error) throw error;
        toast.success('Task added successfully');
      }

      setNewTodo('');
      setPriority('medium');
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingTodo ? 'Error updating task' : 'Error adding task');
    }
  };

  const startEditing = (todo: Task) => {
    setEditingTodo(todo);
    setNewTodo(todo.text);
    setPriority(todo.priority);
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setNewTodo('');
    setPriority('medium');
  };

  const toggleTodo = async (id: string) => {
    if (!userId) return;

    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !todo.completed })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      fetchTodos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating task');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!userId) return;

    try {
      if (editingTodo?.id === id) {
        cancelEditing();
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Task deleted successfully');
      fetchTodos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Tabs */}
      <div className="flex mb-6 bg-[#121212] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('short-term')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'short-term' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ST Tasks
        </button>
        <button
          onClick={() => setActiveTab('long-term')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'long-term' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          LT Tasks
        </button>
      </div>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-[#121212] border border-[#2a2a2a] rounded-lg px-4 py-2 focus:outline-none focus:border-teal-400"
          />
          <div className="flex gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 text-sm sm:text-base"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0"
            >
              {editingTodo ? (
                <>
                  <Edit2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Update</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
            {editingTodo && (
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Todo List */}
      <div className="space-y-3 sm:space-y-4">
        {todos.map(todo => (
          <div
            key={todo.id}
            className={`bg-[#121212] rounded-lg p-3 sm:p-4 flex items-start sm:items-center justify-between transition-all ${
              todo.completed ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => toggleTodo(todo.id)}
                className="focus:outline-none mt-1 sm:mt-0"
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                ) : (
                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm sm:text-base break-words ${todo.completed ? 'line-through' : ''}`}>
                  {todo.text}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-400">{todo.due_date}</span>
                  </div>
                  <Flag className={`w-3 h-3 sm:w-4 sm:h-4 ${getPriorityColor(todo.priority)}`} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEditing(todo)}
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-400 hover:text-red-400 transition-colors ml-2"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No {activeTab} tasks found
          </div>
        )}
      </div>
    </main>
  );
};

export default Tasks;