import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { habitApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Clock, Target, Zap, Award } from 'lucide-react';

export default function FocusStats() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalFocusTime: 0,
    averageSessionLength: 0,
    completionRate: 0,
    streak: 0,
    level: 1
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, [user?._id]);

  const fetchStats = async () => {
    try {
      if (!user?._id) return;
      const response = await habitApi.getFocusSessions(user._id);
      const sessions = response.data;
      
      // Calculate stats from sessions
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.completed).length;
      const totalFocusTime = sessions.reduce((sum, s) => {
        // Only count time from completed sessions or the actual time spent in incomplete ones
        if (s.completed) {
          return sum + s.duration;
        } else {
          const startTime = new Date(s.startTime);
          const endTime = new Date(s.endTime);
          const actualMinutes = Math.floor((endTime - startTime) / (1000 * 60));
          return sum + actualMinutes;
        }
      }, 0);
      
      const averageSessionLength = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0;
      const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
      
      // Calculate streak
      const streak = calculateStreak(sessions);

      setStats({
        totalSessions,
        completedSessions,
        totalFocusTime,
        averageSessionLength,
        completionRate,
        streak,
        level: calculateLevel(totalFocusTime)
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch focus statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions) => {
    if (!sessions.length) return 0;
    
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    );

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = today;

    // Check each day
    while (true) {
      const sessionsOnDate = sortedSessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime() && session.completed;
      });

      if (sessionsOnDate.length === 0) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    if (hours === 0) return `${remainingMinutes}m`;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const calculateLevel = (totalMinutes) => {
    // Level up every 5 hours of focus time
    return Math.floor(totalMinutes / 300) + 1;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-wax-flower-100/10">
            <CardContent className="p-4">
              <div className="h-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, description }) => (
    <Card className="bg-wax-flower-100/10 border-wax-flower-200/20">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-wax-flower-200/10 rounded-full">
            <Icon className="h-6 w-6 text-wax-flower-200" />
          </div>
          <div>
            <p className="text-sm font-medium text-wax-flower-400">{title}</p>
            <h3 className="text-2xl font-bold text-wax-flower-200">{value}</h3>
            {description && (
              <p className="text-sm text-wax-flower-400">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={Clock}
        title="Total Focus Time"
        value={formatTime(stats.totalFocusTime)}
        description={`Level ${calculateLevel(stats.totalFocusTime)}`}
      />
      <StatCard
        icon={Target}
        title="Sessions Completed"
        value={`${stats.completedSessions}`}
        description={`${Math.round(stats.completionRate * 100)}% completion rate`}
      />
      <StatCard
        icon={Zap}
        title="Current Streak"
        value={`${stats.streak} days`}
      />
      <StatCard
        icon={Award}
        title="Average Session"
        value={formatTime(stats.averageSessionLength)}
      />
    </div>
  );
} 