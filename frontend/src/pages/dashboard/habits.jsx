import React, { useState } from 'react';
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

export default function Habits() {
  // Mock data for demonstration
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Get Fit & Healthy",
      description: "Focus on physical well-being",
      expanded: true,
      progress: 65,
      habits: [
        { 
          id: 1, 
          name: "Morning Exercise", 
          frequency: "Daily", 
          streak: 12, 
          completed: true,
          completionHistory: [true, true, true, true, true, false, true] // Last 7 days
        },
        { 
          id: 2, 
          name: "Drink 8 Glasses of Water", 
          frequency: "Daily", 
          streak: 5, 
          completed: true,
          completionHistory: [true, true, true, true, true, true, true]
        },
        { 
          id: 3, 
          name: "Take Vitamins", 
          frequency: "Daily", 
          streak: 0, 
          completed: false,
          completionHistory: [false, true, true, false, true, true, true]
        }
      ]
    },
    {
      id: 2,
      name: "Personal Development",
      description: "Improve skills and knowledge",
      expanded: true,
      progress: 40,
      habits: [
        { 
          id: 4, 
          name: "Read 30 Minutes", 
          frequency: "Daily", 
          streak: 3, 
          completed: true,
          completionHistory: [true, false, true, true, false, true, true]
        },
        { 
          id: 5, 
          name: "Practice Coding", 
          frequency: "Daily", 
          streak: 15, 
          completed: true,
          completionHistory: [true, true, true, true, true, true, true]
        },
        { 
          id: 6, 
          name: "Learn a New Word", 
          frequency: "Daily", 
          streak: 0, 
          completed: false,
          completionHistory: [false, false, true, true, true, true, false]
        }
      ]
    },
    {
      id: 3,
      name: "Mental Well-being",
      description: "Focus on mental health and peace",
      expanded: true,
      progress: 80,
      habits: [
        { 
          id: 7, 
          name: "Morning Meditation", 
          frequency: "Daily", 
          streak: 20, 
          completed: true,
          completionHistory: [true, true, true, true, true, true, true]
        },
        { 
          id: 8, 
          name: "Gratitude Journal", 
          frequency: "Daily", 
          streak: 4, 
          completed: false,
          completionHistory: [false, true, true, true, true, false, true]
        }
      ]
    }
  ]);

  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newHabitOpen, setNewHabitOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleNewGoal = (newGoal) => {
    setGoals([...goals, newGoal]);
  };

  const handleNewHabit = (newHabit) => {
    setGoals((prevGoals) => {
      return prevGoals.map((goal) => {
        if (goal.id === selectedGoal.id) {
          return {
            ...goal,
            habits: [
              ...goal.habits,
              {
                ...newHabit,
                id: Math.random().toString(36).substr(2, 9),
                completed: false,
                streak: 0,
                completionHistory: Array(7).fill(false) // Initialize with 7 days of false
              },
            ],
          };
        }
        return goal;
      });
    });
    setNewHabitOpen(false);
  };

  const toggleGoalExpansion = (goalId) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, expanded: !goal.expanded } : goal
    ));
  };

  const toggleHabitCompletion = (goalId, habitId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedHabits = goal.habits.map(habit => 
          habit.id === habitId ? { 
            ...habit, 
            completed: !habit.completed,
            streak: !habit.completed ? habit.streak + 1 : 0,
            completionHistory: [!habit.completed, ...habit.completionHistory.slice(0, 6)]
          } : habit
        );
        
        // Update goal progress
        const completedCount = updatedHabits.filter(h => h.completed).length;
        const progress = Math.round((completedCount / updatedHabits.length) * 100);
        
        return { ...goal, habits: updatedHabits, progress };
      }
      return goal;
    }));
  };

  const renderCompletionHistory = (history) => {
    // If history is undefined, create an array of 7 false values
    const completionData = history || Array(7).fill(false);
    
    return (
      <div className="flex space-x-1">
        {completionData.map((completed, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              completed ? 'bg-wax-flower-500' : 'bg-wax-flower-800'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wax-flower-200">My Goals & Habits</h1>
          <p className="text-wax-flower-400">Track your progress towards your goals</p>
        </div>
        <Button onClick={() => setNewGoalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="grid gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="border-wax-flower-200/20">
            <CardHeader className="cursor-pointer" onClick={() => toggleGoalExpansion(goal.id)}>
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
                {goal.expanded ? (
                  <ChevronUp className="h-4 w-4 text-wax-flower-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-wax-flower-400" />
                )}
              </div>
              <Progress value={goal.progress} className="mt-2" />
            </CardHeader>
            
            {goal.expanded && (
              <CardContent className="pt-0">
                <div className="grid gap-4">
                  {goal.habits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20">
                      <div className="flex items-center space-x-4">
                        <Checkbox 
                          checked={habit.completed} 
                          onCheckedChange={() => toggleHabitCompletion(goal.id, habit.id)}
                        />
                        <div>
                          <h3 className="font-medium text-wax-flower-200">{habit.name}</h3>
                          <div className="flex items-center space-x-4">
                            <p className="text-sm text-wax-flower-400">{habit.frequency}</p>
                            {renderCompletionHistory(habit.completionHistory)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-wax-flower-300">
                          <span className="font-medium">{habit.streak} day streak</span>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-wax-flower-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setNewHabitOpen(true);
                    }}
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

      <NewHabitDialog
        open={newHabitOpen}
        onOpenChange={setNewHabitOpen}
        onSubmit={handleNewHabit}
        goalName={selectedGoal?.name}
      />
    </div>
  );
} 