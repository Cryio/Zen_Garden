import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from 'lucide-react';

export default function CircularTimer({ 
  timeLeft, 
  totalTime, 
  onAdjustTime, 
  isRunning,
  isBreak 
}) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = ((totalTime - timeLeft) / totalTime) * circumference;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-72 h-72">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-wax-flower-200/10"
          fill="none"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-wax-flower-200 transition-all duration-1000 ease-linear"
          fill="none"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>

      {/* Inner content container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-full m-4">
        {/* Time adjustment buttons and display */}
        <div className="flex items-center justify-center space-x-4">
          {!isRunning && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAdjustTime(-5)}
              className="h-10 w-10 rounded-full hover:bg-wax-flower-200/10"
            >
              <Minus className="h-4 w-4 text-wax-flower-200" />
            </Button>
          )}
          <div className="text-5xl font-bold text-wax-flower-200 min-w-[120px] text-center">
            {formatTime(timeLeft)}
          </div>
          {!isRunning && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAdjustTime(5)}
              className="h-10 w-10 rounded-full hover:bg-wax-flower-200/10"
            >
              <Plus className="h-4 w-4 text-wax-flower-200" />
            </Button>
          )}
        </div>
        
        {/* Session type label */}
        <div className="text-sm text-wax-flower-200/60 mt-2">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </div>
      </div>
    </div>
  );
} 