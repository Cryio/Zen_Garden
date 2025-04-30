import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, MoreVertical, Plus, Filter, X } from 'lucide-react';
import { cn } from "@/lib/utils";

// Sample tasks data
const INITIAL_TASKS = [
  { id: 1, name: "Finish project report", category: "Work", priority: "High", completed: false },
  { id: 2, name: "Buy groceries for dinner", category: "Shopping", priority: "Medium", completed: false },
  { id: 3, name: "Read 20 pages of a book", category: "Learning", priority: "Low", completed: true },
  { id: 4, name: "Morning yoga session", category: "Fitness", priority: "Medium", completed: false },
  { id: 5, name: "Plan weekend getaway", category: "Personal", priority: "Low", completed: false },
  { id: 6, name: "Reply to client emails", category: "Work", priority: "High", completed: false },
  { id: 7, name: "Order new running shoes", category: "Shopping", priority: "Low", completed: true },
  { id: 8, name: "Watch tutorial on React hooks", category: "Learning", priority: "Medium", completed: false },
  { id: 9, name: "Meal prep for the week", category: "Personal", priority: "Medium", completed: false },
  { id: 10, name: "Schedule dentist appointment", category: "Personal", priority: "High", completed: true },
  { id: 11, name: "Finish online course module", category: "Learning", priority: "High", completed: false },
  { id: 12, name: "30-min strength workout", category: "Fitness", priority: "High", completed: false },
  { id: 13, name: "Buy birthday gift for Sarah", category: "Shopping", priority: "High", completed: false },
  { id: 14, name: "Organize desktop files", category: "Work", priority: "Low", completed: true },
  { id: 15, name: "Meditate before bedtime", category: "Fitness", priority: "Low", completed: false },
];

// Available categories
const CATEGORIES = ["Work", "Personal", "Fitness", "Learning", "Shopping", "Others"];

// Available priorities
const PRIORITIES = ["High", "Medium", "Low"];

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [sortBy, setSortBy] = useState('No filter');
  const [editingTask, setEditingTask] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Load initial tasks
  useEffect(() => {
    setTasks(INITIAL_TASKS);
  }, []);

  // Focus input on edit mode
  useEffect(() => {
    if (editingTask && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTask]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const addTask = () => {
    if (!taskName.trim()) return;
    
    const newTask = {
      id: Date.now(),
      name: taskName,
      category,
      priority,
      completed: false
    };
    
    setTasks(prev => [newTask, ...prev]);
    setTaskName('');
    inputRef.current?.focus();
  };

  const toggleTaskCompletion = (id) => {
    setTasks(prev => 
      prev.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      }).sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
      })
    );
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setOpenMenuId(null);
  };

  const startEditTask = (task) => {
    setEditingTask(task.id);
    setEditValue(task.name);
    setOpenMenuId(null);
  };

  const saveEditTask = () => {
    if (!editValue.trim()) {
      setEditingTask(null);
      return;
    }
    
    setTasks(prev => 
      prev.map(task => {
        if (task.id === editingTask) {
          return { ...task, name: editValue };
        }
        return task;
      })
    );
    
    setEditingTask(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditTask();
    } else if (e.key === 'Escape') {
      setEditingTask(null);
    }
  };

  const handleTaskClick = (e, task) => {
    if (e.detail === 2 && !task.completed && !editingTask) { // Double-click
      startEditTask(task);
    }
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getFilteredTasks = () => {
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    const sortTasks = (taskArray) => {
      if (sortBy === 'Priority') {
        return [...taskArray].sort((a, b) => {
          const priorityWeight = { 'High': 0, 'Medium': 1, 'Low': 2 };
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        });
      } else if (sortBy === 'Category') {
        return [...taskArray].sort((a, b) => a.category.localeCompare(b.category));
      }
      return taskArray;
    };
    
    return {
      active: sortTasks(activeTasks),
      completed: sortTasks(completedTasks)
    };
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'bg-red-500/20 text-red-300';
    if (priority === 'Medium') return 'bg-orange-500/20 text-orange-300';
    return 'bg-green-500/20 text-green-300';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Work': return 'bg-blue-500/20 text-blue-300';
      case 'Personal': return 'bg-purple-500/20 text-purple-300';
      case 'Fitness': return 'bg-green-500/20 text-green-300';
      case 'Learning': return 'bg-yellow-500/20 text-yellow-300';
      case 'Shopping': return 'bg-pink-500/20 text-pink-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const { active: activeTasks, completed: completedTasks } = getFilteredTasks();

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200">To-Do List</h1>
          <p className="text-base text-wax-flower-300">Organize and manage your tasks</p>
        </div>
      </div>

      <style jsx="true" global="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(42, 42, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FD6A3A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fd825b;
        }
        .styled-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FD6A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1em;
          padding-right: 2.5rem;
        }
      `}</style>

      {/* Task Creation Tile */}
      <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-[#FD6A3A]" />
          <h2 className="text-xl font-bold text-wax-flower-200">Create Task</h2>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <input
              ref={inputRef}
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task name..."
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-wax-flower-500/50 focus:border-wax-flower-500 outline-none transition-all"
              aria-label="Task name input"
            />
          </div>

          <div className="min-w-[150px] w-full sm:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500/50 focus:border-wax-flower-500 outline-none transition-all styled-select"
              aria-label="Category selection"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px] w-full sm:w-auto">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500/50 focus:border-wax-flower-500 outline-none transition-all styled-select"
              aria-label="Priority selection"
            >
              {PRIORITIES.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>

          <button
            onClick={addTask}
            className="bg-[#FD6A3A] hover:bg-[#FF8C6B] text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto"
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Tasks List Tile */}
      <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 space-y-6">
        {/* Sorting Options */}
        <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-[#FD6A3A]" />
            <span className="text-wax-flower-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-3 py-1 text-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500/50 focus:border-wax-flower-500 outline-none transition-all styled-select"
              aria-label="Sort by options"
            >
              <option value="No filter">No filter</option>
              <option value="Category">Category</option>
              <option value="Priority">Priority</option>
            </select>
          </div>
          <div className="text-sm text-wax-flower-400">
            {activeTasks.length} active, {completedTasks.length} completed
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-wax-flower-200">Active Tasks:</h2>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
            <AnimatePresence>
              {activeTasks.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "bg-wax-flower-950/20 rounded-xl p-4 transition-colors flex items-center gap-4 hover:bg-wax-flower-900/40",
                    task.completed && "opacity-75"
                  )}
                  onClick={(e) => handleTaskClick(e, task)}
                >
                  <div>
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        task.completed ? "bg-[#FD6A3A]/20 border-[#FD6A3A]" : "border-wax-flower-500 hover:border-[#FD6A3A]"
                      )}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed && <Check className="h-4 w-4 text-[#FD6A3A]" />}
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingTask === task.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEditTask}
                        onKeyDown={handleEditKeyDown}
                        className="w-full bg-wax-flower-900/50 border border-wax-flower-700/50 rounded-lg px-2 py-1 text-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500/50 focus:border-wax-flower-500 outline-none transition-all"
                        aria-label="Edit task name"
                      />
                    ) : (
                      <p className={cn(
                        "text-base font-medium",
                        task.completed ? "text-wax-flower-400 line-through" : "text-wax-flower-200"
                      )}>
                        {task.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium w-20 text-center",
                      getCategoryColor(task.category)
                    )}>
                      {task.category}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium w-16 text-center",
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </span>
                    <div className="relative menu-container">
                      <button 
                        className="p-1 rounded-full hover:bg-wax-flower-800 transition-colors"
                        aria-label="Task options"
                        onClick={(e) => toggleMenu(task.id, e)}
                      >
                        <MoreVertical className="h-5 w-5 text-wax-flower-400" />
                      </button>
                      {openMenuId === task.id && (
                        <div className="absolute right-0 mt-1 bg-wax-flower-900 rounded-lg shadow-lg border border-wax-flower-700/30 overflow-hidden w-32 z-10">
                          <div onClick={() => startEditTask(task)} className="px-3 py-2 text-sm text-wax-flower-300 hover:bg-wax-flower-800 cursor-pointer">Edit</div>
                          <div onClick={() => deleteTask(task.id)} className="px-3 py-2 text-sm text-red-400 hover:bg-wax-flower-800 cursor-pointer">Delete</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {activeTasks.length === 0 && (
              <div className="text-center py-8 text-wax-flower-400">
                No active tasks. Add a new task to get started!
              </div>
            )}
          </div>
        </div>
        
        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-wax-flower-200">Completed Tasks:</h2>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
              <AnimatePresence>
                {completedTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="bg-wax-flower-950/20 rounded-xl p-4 transition-colors flex items-center gap-4 hover:bg-wax-flower-900/40 opacity-75"
                  >
                    <div>
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="w-6 h-6 rounded-full border-2 border-[#FD6A3A] bg-[#FD6A3A]/20 flex items-center justify-center"
                        aria-label="Mark as incomplete"
                      >
                        <Check className="h-4 w-4 text-[#FD6A3A]" />
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-wax-flower-400 line-through">
                        {task.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium w-20 text-center",
                        getCategoryColor(task.category)
                      )}>
                        {task.category}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium w-16 text-center",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority}
                      </span>
                      <div className="relative menu-container">
                        <button 
                          className="p-1 rounded-full hover:bg-wax-flower-800 transition-colors"
                          aria-label="Task options"
                          onClick={(e) => toggleMenu(task.id, e)}
                        >
                          <MoreVertical className="h-5 w-5 text-wax-flower-400" />
                        </button>
                        {openMenuId === task.id && (
                          <div className="absolute right-0 mt-1 bg-wax-flower-900 rounded-lg shadow-lg border border-wax-flower-700/30 overflow-hidden w-32 z-10">
                            <div onClick={() => deleteTask(task.id)} className="px-3 py-2 text-sm text-red-400 hover:bg-wax-flower-800 cursor-pointer">Delete</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 