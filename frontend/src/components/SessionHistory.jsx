import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { habitApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Timer, Clock, RefreshCw } from 'lucide-react';

const SessionHistory = forwardRef((props, ref) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      if (!user?._id) return;
      setLoading(true);
      const response = await habitApi.getFocusSessions(user._id);
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

  useImperativeHandle(ref, () => ({
    fetchSessions
  }));

  useEffect(() => {
    fetchSessions();
  }, [user?._id]);

  const formatDuration = (minutes) => {
    if (minutes === 0) return '0m';
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
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <Card className="w-full h-[590px] bg-wax-flower-100/10 border-wax-flower-200/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-wax-flower-500/20 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-wax-flower-500/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[590px] bg-wax-flower-100/10 border-wax-flower-200/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-wax-flower-200/10">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-bold text-wax-flower-200">Session History</CardTitle>
          <button
            onClick={fetchSessions}
            className="p-1 rounded-full hover:bg-wax-flower-200/10 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="h-4 w-4 text-wax-flower-200" />
          </button>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[100px] h-8 text-sm bg-transparent border-wax-flower-200/20 text-wax-flower-200">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[470px]">
          <div className="space-y-px">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-wax-flower-400">
                No focus sessions recorded yet
              </div>
            ) : (
              sortSessions(sessions).map((session) => (
                <div
                  key={session._id}
                  className="px-4 py-3 hover:bg-wax-flower-200/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-wax-flower-200" />                                
                      <span className="text-wax-flower-200 font-medium">
                        {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                      </span>
                      {!session.completed && (
                        <span className="text-xs text-red-500">×</span>
                      )}
                    </div>
                    <span className="text-wax-flower-200">{formatDuration(session.duration)}</span>
                  </div>
                  <div className="flex flex-col text-sm text-wax-flower-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Started: {format(new Date(session.startTime), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Ended: {format(new Date(session.endTime), 'h:mm a')}</span>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="mt-1 text-sm text-wax-flower-400">
                      {session.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

SessionHistory.displayName = 'SessionHistory';

export default SessionHistory; 