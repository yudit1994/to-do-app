// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Archive, Edit, Trash } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch todos
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setTodos(data || []);
  };

  // Filter todos based on active tab
  const filteredTodos = todos.filter(todo => {
    if (activeTab === 'all') return true;
    if (activeTab === 'important') return todo.is_important;
    if (activeTab === 'complete') return todo.is_completed;
    if (activeTab === 'archived') return todo.is_archived;
    return true;
  });

  // Add new task
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        task: newTask,
        is_completed: false,
        is_important: false,
        is_archived: false
      })
      .select();

    if (error) console.error(error);
    else {
      setTodos([data[0], ...todos]);
      setNewTask('');
    }
  };

  // Update task
  const updateTodo = async (id) => {
    if (!editTask.trim()) return;
    
    const { error } = await supabase
      .from('todos')
      .update({ task: editTask })
      .eq('id', id);

    if (error) console.error(error);
    else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, task: editTask } : todo
      ));
      setEditingId(null);
      setEditTask('');
    }
  };

  // Toggle completion status
  const toggleComplete = async (id, is_completed) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', id);

    if (error) console.error(error);
    else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !is_completed } : todo
      ));
    }
  };

  // Toggle important status
  const toggleImportant = async (id, is_important) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_important: !is_important })
      .eq('id', id);

    if (error) console.error(error);
    else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_important: !is_important } : todo
      ));
    }
  };

  // Toggle archive status
  const toggleArchive = async (id, is_archived) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_archived: !is_archived })
      .eq('id', id);

    if (error) console.error(error);
    else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_archived: !is_archived } : todo
      ));
    }
  };

  // Delete task
  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) console.error(error);
    else {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6">
      <div className="max-w-full sm:max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center mb-6 sm:mb-8 md:mb-10 drop-shadow-lg">
          Todo App
        </h1>
        
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6 sm:mb-8 bg-white/10 backdrop-blur-lg rounded-lg p-2 shadow-lg">
          {['all', 'important', 'complete', 'archived'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-white font-medium text-sm sm:text-base transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-blue-600/50 shadow-md'
                  : 'hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-lg">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder:text-gray-300"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
              Add Task
            </Button>
          </div>
        </form>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <p className="text-white text-center opacity-80 text-sm sm:text-base">
              No tasks in this category.
            </p>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white/20 backdrop-blur-lg rounded-lg shadow-md transition-all duration-300 hover:shadow-xl ${
                  todo.is_completed ? 'opacity-70' : ''
                } ${todo.is_archived ? 'bg-gray-500/20' : ''}`}
              >
                {/* Checkbox for completion */}
                <Checkbox
                  checked={todo.is_completed}
                  onCheckedChange={() => toggleComplete(todo.id, todo.is_completed)}
                  disabled={todo.is_archived}
                  className="border-white/50 mt-1 sm:mt-0"
                />

                {/* Task text or edit input */}
                {editingId === todo.id ? (
                  <Input
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder:text-gray-300"
                    autoFocus
                  />
                ) : (
                  <span className={`flex-1 text-white text-sm sm:text-lg ${
                    todo.is_completed ? 'line-through' : ''
                  }`}>
                    {todo.task}
                  </span>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
                  {!todo.is_archived && (
                    <>
                      {editingId === todo.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTodo(todo.id)}
                          className="border-white/50 text-white hover:bg-blue-600/50 text-xs sm:text-sm"
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(todo.id);
                            setEditTask(todo.task);
                          }}
                          className="border-white/50 text-white hover:bg-blue-600/50 text-xs sm:text-sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleImportant(todo.id, todo.is_important)}
                        className="border-white/50 text-white hover:bg-yellow-600/50 text-xs sm:text-sm"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            todo.is_important ? 'fill-yellow-400 text-yellow-400' : ''
                          }`}
                        />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleArchive(todo.id, todo.is_archived)}
                    className="border-white/50 text-white hover:bg-gray-600/50 text-xs sm:text-sm"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="border-white/50 text-white hover:bg-red-600/50 text-xs sm:text-sm"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}