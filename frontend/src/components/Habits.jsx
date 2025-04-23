import React from 'react';
import { useAuth } from '@/lib/auth';
import { habitApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { NewGoalDialog } from '@/components/NewGoalDialog';
import { NewHabitDialog } from '@/components/NewHabitDialog';
import { EditGoalDialog } from '@/components/EditGoalDialog';
import { EditHabitDialog } from '@/components/EditHabitDialog';
import { MoreVertical, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Habits() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = React.useState(false);
  const [isNewHabitDialogOpen, setIsNewHabitDialogOpen] = React.useState(false);
  const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = React.useState(false);
  const [isEditHabitDialogOpen, setIsEditHabitDialogOpen] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState(null);
  const [selectedHabit, setSelectedHabit] = React.useState(null);
  const [stats, setStats] = React.useState({
    totalHabits: 0,
    completedHabits: 0,
    completionRate: 0
  });

  React.useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && user?._id) {
        try {
          setIsLoading(true);
          const response = await habitApi.getGoals(user._id);
          if (response?.data) {
            setGoals(response.data);
            calculateStats(response.data);
          }
        } catch (error) {
          console.error('Error fetching goals:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  const calculateStats = React.useCallback((goals) => {
    let totalHabits = 0;
    let completedHabits = 0;

    goals.forEach(goal => {
      if (goal.habits) {
        goal.habits.forEach(habit => {
          totalHabits++;
          if (habit.completed) {
            completedHabits++;
          }
        });
      }
    });

    const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    setStats({
      totalHabits,
      completedHabits,
      completionRate
    });
  }, []);

  const handleCreateGoal = React.useCallback(async (goalData) => {
    if (!user?._id) {
      throw new Error('Please sign in to create a goal');
    }

    const response = await habitApi.createGoal(user._id, goalData);
    
    if (!response?.data) {
      throw new Error('Failed to create goal');
    }

    setGoals(prevGoals => {
      const newGoals = [...prevGoals, response.data];
      calculateStats(newGoals);
      return newGoals;
    });

    // Set the newly created goal as the selected goal and close the dialog
    setSelectedGoal(response.data);
    setIsNewGoalDialogOpen(false);
  }, [user?._id, calculateStats]);

  const handleNewHabit = React.useCallback(async (habitData) => {
    if (!user?._id || !selectedGoal?._id) {
      console.error('No user ID or goal ID available');
      return;
    }

    try {
      const response = await habitApi.createHabit(user._id, selectedGoal._id, habitData);
      if (response?.data) {
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal._id === selectedGoal._id 
              ? { ...goal, habits: [...(goal.habits || []), { ...response.data, goalId: selectedGoal._id }] }
              : goal
          )
        );
        calculateStats(goals);
        setIsNewHabitDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }, [user?._id, selectedGoal?._id, goals, calculateStats]);

  const handleCreateHabit = async (habitData) => {
    try {
      await handleNewHabit(habitData);
    } catch (error) {
      console.error('Error in handleCreateHabit:', error);
    }
  };

  const handleAddHabit = (goal) => {
    if (!goal?._id) {
      console.error('No goal ID available');
      return;
    }
    setSelectedGoal(goal);
    setIsNewHabitDialogOpen(true);
  };

  const handleEditGoal = async (goalData) => {
    try {
      if (!user?._id || !selectedGoal?._id) {
        console.error('No user ID or goal ID available');
        return;
      }

      const response = await habitApi.updateGoal(user._id, selectedGoal._id, goalData);
      if (response?.data) {
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal._id === selectedGoal._id ? response.data : goal
          )
        );
        calculateStats(goals);
        setIsEditGoalDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleEditHabit = async (habitData) => {
    try {
      if (!user?._id || !selectedGoal?._id || !selectedHabit?._id) {
        console.error('Missing required IDs');
        return;
      }

      const response = await habitApi.updateHabit(user._id, selectedGoal._id, selectedHabit._id, habitData);
      if (response?.data) {
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal._id === selectedGoal._id
              ? {
                  ...goal,
                  habits: goal.habits.map(habit => 
                    habit._id === selectedHabit._id ? response.data : habit
                  )
                }
              : goal
          )
        );
        calculateStats(goals);
        setIsEditHabitDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      if (!user?._id || !goalId) {
        console.error('No user ID or goal ID available');
        return;
      }

      await habitApi.deleteGoal(user._id, goalId);
      setGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
      calculateStats(goals.filter(goal => goal._id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleDeleteHabit = async (goalId, habitId) => {
    try {
      if (!user?._id || !goalId || !habitId) {
        console.error('Missing required IDs');
        return;
      }

      await habitApi.deleteHabit(user._id, goalId, habitId);
      
      // Update goals state
      setGoals(prevGoals => {
        const updatedGoals = prevGoals.map(goal => 
          goal._id === goalId
            ? {
                ...goal,
                habits: goal.habits.filter(habit => habit._id !== habitId)
              }
            : goal
        );
        
        // Calculate stats with the updated goals
        calculateStats(updatedGoals);
        return updatedGoals;
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleHabitCompletion = async (goalId, habitId, completed) => {
    try {
      if (!user?._id || !goalId || !habitId) {
        console.error('Missing required IDs');
        return;
      }

      const response = await habitApi.updateHabitCompletion(user._id, goalId, habitId, completed);
      if (response?.data) {
        setGoals(prevGoals => {
          const updatedGoals = prevGoals.map(goal => 
            goal._id === goalId
              ? {
                  ...goal,
                  habits: goal.habits.map(habit => 
                    habit._id === habitId ? response.data : habit
                  )
                }
              : goal
          );
          
          // Calculate stats with the updated goals
          calculateStats(updatedGoals);
          return updatedGoals;
        });
      }
    } catch (error) {
      console.error('Error updating habit completion:', error);
    }
  };

  const handleEditGoalClick = React.useCallback((goal) => {
    setSelectedGoal(goal);
    setIsEditGoalDialogOpen(true);
  }, []);

  const handleDeleteGoalClick = React.useCallback((goalId) => {
    if (!goalId) {
      console.error('No goal ID available');
      return;
    }
    handleDeleteGoal(goalId);
  }, [handleDeleteGoal]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-4 animate-spin text-wax-flower-500" />
      </div>
    );
  }

  if (!user?._id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-wax-flower-200 mb-4">Please Sign In</h1>
        <p className="text-wax-flower-400">You need to be signed in to view and manage your goals.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wax-flower-200">My Goals & Habits</h1>
          <p className="text-wax-flower-400">Track your progress towards your goals</p>
        </div>
        <Button
          onClick={() => setIsNewGoalDialogOpen(true)}
          className="bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
          disabled={!user?._id}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card key={`stats-total-${stats.totalHabits}`} className="bg-black/50 border-wax-flower-200/20">
          <CardHeader>
            <CardTitle className="text-wax-flower-200">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-wax-flower-200">{stats.totalHabits}</p>
          </CardContent>
        </Card>
        <Card key={`stats-completed-${stats.completedHabits}`} className="bg-black/50 border-wax-flower-200/20">
          <CardHeader>
            <CardTitle className="text-wax-flower-200">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-wax-flower-200">{stats.completedHabits}</p>
          </CardContent>
        </Card>
        <Card key={`stats-rate-${stats.completionRate}`} className="bg-black/50 border-wax-flower-200/20">
          <CardHeader>
            <CardTitle className="text-wax-flower-200">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-wax-flower-200">{Math.round(stats.completionRate)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal._id} className="bg-black/50 border-wax-flower-200/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-wax-flower-200">{goal.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4 text-wax-flower-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border-wax-flower-200/20">
                  <DropdownMenuItem
                    key="edit-goal"
                    className="text-wax-flower-200 hover:bg-wax-flower-500/20"
                    onClick={() => handleEditGoalClick(goal)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Goal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    key="delete-goal"
                    className="text-wax-flower-200 hover:bg-wax-flower-500/20"
                    onClick={() => handleDeleteGoalClick(goal._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-wax-flower-400 mb-4">{goal.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-wax-flower-200">Progress</span>
                <span className="text-wax-flower-200">{Math.round(goal.progress || 0)}%</span>
              </div>
              <Progress value={goal.progress || 0} className="bg-wax-flower-200/20" />
              <div className="mt-4">
                <Button
                  onClick={() => handleAddHabit(goal)}
                  className="w-full bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Habit
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {goal.habits && goal.habits.map((habit) => (
                  <div key={habit._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={habit._id}
                        checked={habit.completed}
                        onCheckedChange={(checked) => handleHabitCompletion(goal._id, habit._id, checked)}
                        className="border-wax-flower-200/20"
                      />
                      <label
                        htmlFor={habit._id}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          habit.completed ? 'text-wax-flower-400 line-through' : 'text-wax-flower-200'
                        }`