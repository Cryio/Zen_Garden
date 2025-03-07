import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Leaf, Trophy, Calendar, TrendingUp } from 'lucide-react';

export default function Overview() {
  // Mock data for demonstration
  const stats = [
    { title: "Active Habits", value: "8", icon: Leaf, color: "text-green-500" },
    { title: "Achievements", value: "12", icon: Trophy, color: "text-yellow-500" },
    { title: "Current Streak", value: "5 days", icon: Calendar, color: "text-blue-500" },
    { title: "Monthly Progress", value: "78%", icon: TrendingUp, color: "text-purple-500" }
  ];

  const recentActivity = [
    { habit: "Morning Meditation", status: "Completed", time: "2 hours ago" },
    { habit: "Read a Book", status: "Missed", time: "Yesterday" },
    { habit: "Exercise", status: "Completed", time: "Yesterday" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, User!</h1>
          <p className="text-muted-foreground">Here's your habit tracking overview</p>
        </div>
        <Button>Add New Habit</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Garden Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Garden Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Current Garden Level</span>
              <span className="font-bold">Level 3</span>
            </div>
            <Progress value={65} />
            <p className="text-sm text-muted-foreground">
              235 points until next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activity.habit}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <span className={`text-sm ${
                  activity.status === "Completed" ? "text-green-500" : "text-red-500"
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 