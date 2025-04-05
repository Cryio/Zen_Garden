import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Plus, Trophy, Calendar, Target, Leaf } from 'lucide-react';
import DashboardLayout from './layout';

export default function Dashboard() {
  const stats = [
    {
      title: "Current Streak",
      value: "12 days",
      change: "+3 days",
      isPositive: true,
      icon: <Trophy className="w-4 h-4" />
    },
    {
      title: "Habits Completed",
      value: "24/30",
      change: "80% completion",
      isPositive: true,
      icon: <Target className="w-4 h-4" />
    },
    {
      title: "Garden Growth",
      value: "Level 5",
      change: "+2 flowers this week",
      isPositive: true,
      icon: <Leaf className="w-4 h-4" />
    },
    {
      title: "Next Milestone",
      value: "15 days",
      change: "3 days remaining",
      isPositive: null,
      icon: <Calendar className="w-4 h-4" />
    }
  ];

  const recentHabits = [
    { name: "Morning Meditation", status: "completed", time: "8:00 AM" },
    { name: "Read a Book", status: "missed", time: "Yesterday" },
    { name: "Exercise", status: "completed", time: "10:30 AM" },
    { name: "Drink Water", status: "in-progress", time: "Ongoing" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-in">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, User!</h1>
            <p className="text-muted-foreground">Here's your habit tracking overview</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Habit
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          {stats.map((stat, index) => (
            <Card key={index} className="stats-card">
              <div className="flex items-center justify-between">
                <span className="stats-title">{stat.title}</span>
                {stat.icon}
              </div>
              <div className="stats-value">{stat.value}</div>
              <div className={`stats-change ${stat.isPositive === true ? 'positive' : stat.isPositive === false ? 'negative' : ''}`}>
                {stat.isPositive === true ? <ArrowUp className="w-3 h-3" /> : 
                 stat.isPositive === false ? <ArrowDown className="w-3 h-3" /> : null}
                {stat.change}
              </div>
            </Card>
          ))}
        </div>

        {/* Garden Preview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Garden</h2>
          <div className="garden-grid h-[200px]">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className={`garden-cell ${
                  Math.random() > 0.5
                    ? ['activity-none', 'activity-low', 'activity-medium', 'activity-high', 'activity-max'][
                        Math.floor(Math.random() * 5)
                      ]
                    : 'activity-none'
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentHabits.map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    habit.status === 'completed' ? 'bg-green-500' :
                    habit.status === 'missed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span>{habit.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{habit.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 