import React, { useRef } from 'react';
import PomodoroTimer from '@/components/PomodoroTimer';
import SessionHistory from '@/components/SessionHistory';
import FocusStats from '@/components/FocusStats';

export default function PomodoroPage() {
  const sessionHistoryRef = useRef();

  const handleSessionComplete = () => {
    // Refresh session history when a session is completed
    if (sessionHistoryRef.current) {
      sessionHistoryRef.current.fetchSessions();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-wax-flower-200">Pomodoro Timer</h1>
        <p className="text-wax-flower-400">Focus and relax with timed sessions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PomodoroTimer onSessionComplete={handleSessionComplete} />
          <FocusStats />
        </div>
        <SessionHistory ref={sessionHistoryRef} />
      </div>
    </div>
  );
} 