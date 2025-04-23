import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MoreVertical, Edit, Trash, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import NewGoalDialog from '@/components/NewGoalDialog';
import NewHabitDialog from '@/components/NewHabitDialog';
import { habitApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Habits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newHabitOpen, setNewHabitOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  const calculateGoalProgress = useCallback((goal) => {
    if (!goal.habits || goal.habits.length === 0) return 0;
    const completedHabits = goal.habits.filter(habit => habit.completed).length;
    return Math.round((completedHabits / goal.habits.length) * 100);
  }, []);

  const updateGoalProgress = useCallback((goals) => {
    return goals.map(goal => ({
      ...goal,
      progress: calculateGoalProgress(goal)
    }));
  }, [calculateGoalProgress]);

  const updateHabitStatuses = useCallback(async () => {
    if (!user?._id || !goals.length) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const updatedGoals = await Promise.all(goals.map(async (goal) => {
        const updatedHabits = await Promise.all(goal.habits.map(async (habit) => {
          // Check if habit was completed yesterday but not today
          const lastCompletedDate = habit.lastCompleted?.split('T')[0];
          if (lastCompletedDate && lastCompletedDate !== today) {
            // Reset completion status for the new day
            const response = await habitApi.updateHabitCompletion(user._id, goal._id, habit._id, false);
            if (response?.data) {
              return {
                ...habit,
                completed: false,
                lastCompleted: null
              };
            }
          }
          return habit;
        }));

        return {
          ...goal,
          habits: updatedHabits
        };
      }));

      // Only update if there are actual changes
      const hasChanges = JSON.stringify(updatedGoals) !== JSON.stringify(goals);
      if (hasChanges) {
        setGoals(prevGoals => updateGoalProgress(updatedGoals));
      }
    } catch (error) {
      console.error('Error updating habit statuses:', error);
    }
  }, [user?._id, goals, updateGoalProgress]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
      fetchGoals();
  }, [user, navigate]);

  useEffect(() => {
    if (goals.length > 0) {
      updateHabitStatuses();
    }
  }, [goals, updateHabitStatuses]);

  const fetchGoals = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await habitApi.getGoals(user._id);
      if (response?.data) {
        setGoals(Array.isArray(response.data) ? response.data.map(goal => ({ ...goal, expanded: false })) : []);
      }
    } catch (error) {
      toast.error('Failed to fetch goals');
      console.error('Error fetching goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewGoal = useCallback(async (goalData) => {
    if (!user?._id) return;
    
    try {
      const response = await habitApi.createGoal(user._id, {
        ...goalData,
        habits: []
      });
      if (response?.data) {
        setGoals(prevGoals => [...prevGoals, { ...response.data, expanded: false }]);
        setNewGoalOpen(false);
        toast.success('Goal created successfully');
      }
    } catch (error) {
      toast.error('Failed to create goal');
      console.error('Error creating goal:', error);
    }
  }, [user?._id]);

  const handleNewHabit = useCallback(async (habitData) => {
    if (!user?._id || !selectedGoalId) return;

    try {
      const response = await habitApi.createHabit(user._id, selectedGoalId, {
        ...habitData,
        startDate: new Date(habitData.startDate),
        endDate: new Date(habitData.endDate),
        completed: false
      });
      
      if (response?.data) {
        setGoals(prevGoals => 
          prevGoals.map(goal => {
            if (goal._id === selectedGoalId) {
              // Ensure habits array exists and add the new habit
              const updatedHabits = [...(goal.habits || []), response.data];
              return {
                ...goal,
                habits: updatedHabits,
                progress: calculateGoalProgress({ ...goal, habits: updatedHabits })
              };
            }
            return goal;
          })
        );
        setNewHabitOpen(false);
        toast.success('Habit created successfully');
      }
    } catch (error) {
      toast.error('Failed to create habit');
      console.error('Error creating habit:', error);
    }
  }, [user?._id, selectedGoalId, calculateGoalProgress]);

  const handleDeleteGoal = useCallback(async (goalId) => {
    if (!user?._id) return;

    try {
      const response = await habitApi.deleteGoal(user._id, goalId);
      if (response?.data) {
        setGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
        toast.success('Goal deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete goal');
      console.error('Error deleting goal:', error);
    }
  }, [user?._id]);

  const handleDeleteHabit = useCallback(async (goalId, habitId) => {
    if (!user?._id) return;
    
    try {
      await habitApi.deleteHabit(user._id, goalId, habitId);
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal._id === goalId
            ? { ...goal, habits: goal.habits.filter(habit => habit._id !== habitId) }
            : goal
        )
      );
        toast.success('Habit deleted successfully');
    } catch (error) {
      toast.error('Failed to delete habit');
      console.error('Error deleting habit:', error);
    }
  }, [user?._id]);

  const toggleGoalExpansion = useCallback((goalId) => {
    setGoals(prevGoals => {
      if (!Array.isArray(prevGoals)) return [];
      return prevGoals.map(goal => ({
        ...goal,
        expanded: goal._id === goalId ? !goal.expanded : false
      }));
    });
  }, []);

  const calculateStreak = useCallback((habit) => {
    if (!habit.completionHistory) return 0;
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // If habit is completed today, include it in the streak
    if (habit.completed && habit.lastCompleted?.split('T')[0] === today) {
      currentStreak = 1;
    }

    // Check previous days
    for (let i = 1; i < habit.completionHistory.length; i++) {
      if (!habit.completionHistory[i]) break;
      currentStreak++;
    }

    return currentStreak;
  }, []);

  const toggleHabitCompletion = useCallback(async (goalId, habitId, completed) => {
    if (!user?._id) return;
    
    try {
      const today = new Date().toISOString();
      const response = await habitApi.updateHabitCompletion(user._id, goalId, habitId, !completed);
      
      if (response?.data) {
        setGoals(prevGoals => {
          const newGoals = prevGoals.map(goal => {
            if (goal._id === goalId) {
              const updatedHabits = goal.habits.map(habit => {
                if (habit._id === habitId) {
                  // Update completion history
                  const newHistory = [...(habit.completionHistory || Array(7).fill(false))];
                  newHistory.unshift(!completed); // Add today's completion status
                  newHistory.pop(); // Remove oldest day

                  return {
                    ...habit,
                    completed: !completed,
                    lastCompleted: !completed ? today : null,
                    completionHistory: newHistory,
                    streak: !completed ? calculateStreak({
                      ...habit,
                      completed: !completed,
                      lastCompleted: today,
                      completionHistory: newHistory
                    }) : 0
                  };
                }
                return habit;
              });

              return {
                ...goal,
                habits: updatedHabits
              };
            }
            return goal;
          });

          return updateGoalProgress(newGoals);
        });
        
        toast.success('Habit status updated');
      }
    } catch (error) {
      toast.error('Failed to update habit status');
      console.error('Error updating habit:', error);
    }
  }, [user?._id, calculateStreak, updateGoalProgress]);

  // Update progress whenever habits change
  useEffect(() => {
    if (goals.length > 0) {
      setGoals(prevGoals => updateGoalProgress(prevGoals));
    }
  }, [updateGoalProgress]);

  const renderCompletionHistory = (history, streak) => {
    const completionData = history || Array(7).fill(false);
    
    return (
      <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {completionData.map((completed, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              completed ? 'bg-wax-flower-500' : 'bg-wax-flower-800'
            }`}
              title={`${index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index} days ago`}`}
          />
        ))}
        </div>
        {streak > 0 && (
          <span className="text-xs text-wax-flower-400">
            {streak} day streak! 🔥
          </span>
        )}
      </div>
    );
  };

  const handleAddHabit = useCallback((goal) => {
    if (!goal?._id) {
      console.error('No goal ID available');
      toast.error('Unable to add habit: Goal ID not available');
      return;
    }
    setSelectedGoalId(goal._id);
    console.log('Setting goal ID:', goal._id); // Log for debugging
    setNewHabitOpen(true);
  }, []);

  const handleCloseHabitDialog = useCallback((open) => {
    setNewHabitOpen(open);
    if (!open) {
      // Reset the selected goal ID when closing the dialog
      console.log('Clearing selectedGoalId');
      setSelectedGoalId(null);
    }
  }, []);

  const handleHabitStatusUpdate = useCallback(async (goalId, habitId, completed) => {
    if (!user?._id) return;
    
    try {
      const response = await habitApi.updateHabitCompletion(user._id, goalId, habitId, completed);
      
      if (response?.data) {
        setGoals(prevGoals => 
          prevGoals.map(goal => {
            if (goal._id === goalId) {
              const updatedHabits = goal.habits.map(habit => 
                habit._id === habitId ? { ...habit, completed, lastCompleted: completed ? new Date().toISOString() : null } : habit
              );
              return {
                ...goal,
                habits: updatedHabits,
                progress: calculateGoalProgress({ ...goal, habits: updatedHabits })
              };
            }
            return goal;
          })
        );
      }
    } catch (error) {
      toast.error('Failed to update habit status');
      console.error('Error updating habit status:', error);
    }
  }, [user?._id, calculateGoalProgress]);

  const renderHabit = useCallback((goal, habit) => (
    <div key={habit._id} className="flex flex-col p-3 hover:bg-wax-flower-800/10 rounded-lg border border-wax-flower-800/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={habit.completed}
            onCheckedChange={(checked) => handleHabitStatusUpdate(goal._id, habit._id, checked)}
            className="border-wax-flower-500"
          />
          <div>
            <span className={`text-wax-flower-200 font-medium ${habit.completed ? 'line-through opacity-50' : ''}`}>
              {habit.name}
            </span>
            {habit.description && (
              <p className="text-xs text-wax-flower-400 mt-1">{habit.description}</p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-wax-flower-400 hover:text-wax-flower-200">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black border-wax-flower-200/20">
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              onClick={() => handleDeleteHabit(goal._id, habit._id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Habit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-wax-flower-400">
        <div>
          <span className="block">Start: {new Date(habit.startDate).toLocaleDateString()}</span>
          <span className="block">End: {new Date(habit.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-end">
          <span className={`px-2 py-1 rounded-full text-xs ${
            habit.category === 'health' ? 'bg-green-500/20 text-green-400' :
            habit.category === 'learning' ? 'bg-blue-500/20 text-blue-400' :
            habit.category === 'mindfulness' ? 'bg-purple-500/20 text-purple-400' :
            habit.category === 'productivity' ? 'bg-orange-500/20 text-orange-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {habit.category}
          </span>
        </div>
      </div>
    </div>
  ), [handleHabitStatusUpdate, handleDeleteHabit]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wax-flower-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wax-flower-200">My Goals & Habits</h1>
          <p className="text-wax-flower-400">Track your progress towards your goals</p>
        </div>
        <Button 
          onClick={() => setNewGoalOpen(true)}
          className="bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="grid gap-6">
        {Array.isArray(goals) && goals.map((goal) => (
          <Card key={goal._id} className="border-wax-flower-200/20 bg-black/50">
            <CardHeader className="cursor-pointer" onClick={() => toggleGoalExpansion(goal._id)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-wax-flower-200">{goal.name}</CardTitle>
                    {goal.progress === 100 && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-wax-flower-400">{goal.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-wax-flower-200" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black border-wax-flower-200/20">
                      <DropdownMenuItem
                        className="text-wax-flower-200 hover:bg-wax-flower-500/20"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Goal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {goal.expanded ? (
                    <ChevronUp className="h-4 w-4 text-wax-flower-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-wax-flower-400" />
                  )}
                </div>
              </div>
              <Progress value={goal.progress} className="mt-2 bg-wax-flower-200/20" />
            </CardHeader>
            
            {goal.expanded && (
              <CardContent className="pt-0">
                <div className="grid gap-4">
                  {goal.habits?.map((habit) => renderHabit(goal, habit))}
                  <Button
                    onClick={() => handleAddHabit(goal)}
                    className="w-full bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Habit
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <NewGoalDialog
        open={newGoalOpen}
        onOpenChange={setNewGoalOpen}
        onSubmit={handleNewGoal}
      />

      {selectedGoalId && (
      <NewHabitDialog
        open={newHabitOpen}
          onOpenChange={handleCloseHabitDialog}
        onSave={handleNewHabit}
          goalId={selectedGoalId}
      />
      )}
    </div>
  );
} 