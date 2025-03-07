"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle2, XCircle } from "lucide-react";

export default function Dashboard() {
  // Mock data - replace with actual data from your backend
  const habits = [
    {
      id: 1,
      name: "Morning Meditation",
      streak: 7,
      progress: 85,
      status: "completed",
      frequency: "Daily",
    },
    {
      id: 2,
      name: "Exercise",
      streak: 3,
      progress: 60,
      status: "in-progress",
      frequency: "3x/week",
    },
    {
      id: 3,
      name: "Reading",
      streak: 0,
      progress: 0,
      status: "not-started",
      frequency: "Daily",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-gray-300">Track your habits and build a better life</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Habit
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">7 days</div>
              <p className="text-gray-400">Best: 14 days</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">85%</div>
              <Progress value={85} className="mt-2 bg-purple-900/30" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Active Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">3</div>
              <p className="text-gray-400">2 completed today</p>
            </CardContent>
          </Card>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <Card key={habit.id} className="bg-white/5 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white">{habit.name}</CardTitle>
                  <Badge variant={habit.status === "completed" ? "default" : "secondary"}>
                    {habit.frequency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Streak</span>
                    <span className="text-white font-semibold">{habit.streak} days</span>
                  </div>
                  <Progress value={habit.progress} className="bg-purple-900/30" />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="border-purple-500/20">
                      <XCircle className="h-4 w-4 mr-1" />
                      Skip
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Habit Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                className="rounded-md border-purple-500/20 bg-white/5"
                classNames={{
                  day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                  day_today: "bg-purple-900/30 text-white",
                  day: "text-white hover:bg-purple-900/30",
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between">
                    <span className="text-gray-300">{habit.name}</span>
                    <div className="flex space-x-1">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < Math.floor(habit.progress / 15)
                              ? "bg-purple-600"
                              : "bg-purple-900/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
