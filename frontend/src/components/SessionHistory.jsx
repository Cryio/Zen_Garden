import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { habitApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Timer, AlertCircle, Check, X } from 'lucide-react';

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  const fetchSessions = async () => {
    try {
      if (!user?.id) return;
      const response = await habitApi.getFocusSessions(user.id);
      setSessions(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch focus sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const sortSessions = (sessions) => {
    return [...sessions].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startTime) - new Date(a.startTime);
        case 'duration':
          return b.duration - a.duration;
        case 'type':
          return a.sessionType.localeCompare(b.sessionType);
        default:
          return 0;
      }
    });
  };

  const getSessionTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'pomodoro':
        return 'text-green-500';
      case 'break':
        return 'text-blue-500';
      case 'long-break':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'pomodoro':
        return <Timer className="h-4 w-4 text-wax-flower-500" />;
      case 'break':
        return <Timer className="h-4 w-4 text-green-500" />;
      case 'long-break':
        return <Timer className="h-4 w-4 text-blue-500" />;
      default:
        return <Timer className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full bg-black/50 border-wax-flower-200/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-wax-flower-500/20 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-wax-flower-500/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-black/50 border-wax-flower-200/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-wax-flower-200">Session History</CardTitle>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-wax-flower-400">
              No focus sessions recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {sortSessions(sessions).map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-wax-flower-100/10 hover:bg-wax-flower-100/20 transition-colors"
                >
                  <div className="space-y-1">
                    <p className={`font-medium ${getSessionTypeColor(session.sessionType)}`}>
                      {session.sessionType}
                    </p>
                    <p className="text-sm text-wax-flower-400">
                      {format(new Date(session.startTime), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-wax-flower-200">
                      {formatDuration(session.duration)}
                    </p>
                    {session.interruptions > 0 && (
                      <p className="text-sm text-wax-flower-400">
                        {session.interruptions} interruption{session.interruptions > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 