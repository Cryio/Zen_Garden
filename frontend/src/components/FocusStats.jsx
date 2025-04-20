import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { habitApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Clock, Target, Zap, Award } from 'lucide-react';

export default function FocusStats() {
  const [stats, setStats] = useState({
    totalSessions: 0,
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
  }, [user?.id]);

  const fetchStats = async () => {
    try {
      if (!user?.id) return;
      const response = await habitApi.getFocusStats(user.id);
      setStats(response.data);
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

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    if (hours === 0) return `${minutes}m`;
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const calculateLevel = (totalMinutes) => {
    // Level up every 5 hours of focus time
    return Math.floor(totalMinutes / 300) + 1;
  };

  const StatCard = ({ icon: Icon, title, value, description }) => (
    <Card className="bg-wax-flower-100/10 border-wax-flower-200/20">
      <CardContent className="p-6">
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-wax-flower-100/10">
            <CardContent className="p-6">
              <div className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
        value={stats.totalSessions}
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