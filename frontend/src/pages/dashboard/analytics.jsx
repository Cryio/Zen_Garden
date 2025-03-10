import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon,
  Target,
  Award
} from 'lucide-react';

export default function Analytics() {
  // Mock data for demonstration
  const stats = [
    {
      title: "Completion Rate",
      value: "85%",
      change: "+5%",
      trend: "up",
      description: "vs last month"
    },
    {
      title: "Current Streak",
      value: "12 days",
      change: "+3",
      trend: "up",
      description: "consecutive days"
    },
    {
      title: "Total Habits",
      value: "8",
      change: "-1",
      trend: "down",
      description: "vs last month"
    }
  ];

  const habitStats = [
    { name: "Morning Meditation", progress: 90, streak: 15 },
    { name: "Exercise", progress: 75, streak: 8 },
    { name: "Reading", progress: 60, streak: 5 },
    { name: "Learning", progress: 85, streak: 12 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your progress and improvements</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-wax-flower-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-wax-flower-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend === "up" ? "text-wax-flower-500" : "text-wax-flower-600"}>
                  {stat.change}
                </span>
                {" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Habit Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {habitStats.map((habit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {habit.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {habit.streak} day streak
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {habit.progress}%
                  </div>
                </div>
                <Progress value={habit.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 