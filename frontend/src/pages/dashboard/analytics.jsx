import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- DEMO DATA GENERATION HELPERS ---
const randomStreak = () => Math.floor(Math.random() * 40);
const randomProgress = () => Math.floor(Math.random() * 101);
const randomBool = () => Math.random() > 0.5;
const streakColor = (streak) => {
  if (streak > 25) return 'bg-green-500';
  if (streak > 15) return 'bg-yellow-400';
  if (streak > 5) return 'bg-orange-400';
  return 'bg-red-500';
};
const truncate = (str, n = 14) => str.length > n ? str.slice(0, n - 3) + '...' : str;

// --- DEMO HABITS ---
const DEMO_HABITS = [
  { _id: '1', name: 'Technical Reading', goalName: 'Learning', start: '2024-03-01', end: '2024-06-01' },
  { _id: '2', name: 'Morning Run', goalName: 'Fitness', start: '2024-03-01', end: '2024-06-01' },
  { _id: '3', name: 'Meditation', goalName: 'Wellness', start: '2024-03-01', end: '2024-06-01' },
  { _id: '4', name: 'Long Habit Name Example', goalName: 'Focus', start: '2024-03-01', end: '2024-06-01' },
  { _id: '5', name: 'Journaling', goalName: 'Reflection', start: '2024-03-01', end: '2024-06-01' },
];

// --- DEMO GOALS ---
const DEMO_GOALS = [
  { _id: '1', name: 'Learning', habitCount: 3, health: 85, priority: 'High' },
  { _id: '2', name: 'Fitness', habitCount: 2, health: 60, priority: 'Medium' },
  { _id: '3', name: 'Wellness', habitCount: 4, health: 90, priority: 'High' },
  { _id: '4', name: 'Focus', habitCount: 1, health: 30, priority: 'Low' },
  { _id: '5', name: 'Reflection', habitCount: 2, health: 75, priority: 'Medium' },
];

// --- GENERATE DEMO COMPLETION HISTORY FOR 2 MONTHS ---
const getDateStr = (date) => date.toISOString().split('T')[0];
const getPastDates = (days) => {
  const arr = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(new Date(d));
  }
  return arr.reverse();
};
const PAST_2_MONTHS = getPastDates(62);
const DEMO_HABITS_WITH_HISTORY = DEMO_HABITS.map(habit => ({
  ...habit,
  streak: randomStreak(),
  progress: randomProgress(),
  completionHistory: PAST_2_MONTHS.map(date => ({
    date: getDateStr(date),
    completed: randomBool(),
  })),
}));

// --- HOVER POPUP COMPONENT ---
const HoverPopup = ({ date, completed, notCompleted, position }) => (
  <div
    className="fixed z-50 min-w-[220px] max-w-xs max-h-60 overflow-y-auto rounded-xl shadow-lg border border-wax-flower-700/30 bg-wax-flower-900/95 p-4"
    style={{
      left: position.x - 40,
      top: position.y - 120,
    }}
  >
    <div className="text-wax-flower-200 font-semibold mb-2 text-center">
      {date.toLocaleDateString()}
    </div>
    <div className="space-y-1">
      {completed.map(h => (
        <div key={h._id} className="bg-green-900/80 text-green-300 rounded px-2 py-1 text-sm">
          ✓ {truncate(h.name)}
        </div>
      ))}
      {notCompleted.map(h => (
        <div key={h._id} className="bg-red-900/80 text-red-300 rounded px-2 py-1 text-sm">
          ✗ {truncate(h.name)}
        </div>
      ))}
    </div>
  </div>
);

// --- WEEKLY OVERVIEW ---
const WeeklyOverview = ({ habits }) => {
  const [weekStartIdx, setWeekStartIdx] = useState(PAST_2_MONTHS.length - 7);
  const [hovered, setHovered] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(null);

  // Generate random bar heights for demonstration
  const barHeights = [65, 40, 85, 30, 50, 75, 60];

  const weekDates = PAST_2_MONTHS.slice(weekStartIdx, weekStartIdx + 7);
  const todayStr = getDateStr(new Date());
  const canGoNext = weekStartIdx + 7 < PAST_2_MONTHS.length && getDateStr(PAST_2_MONTHS[weekStartIdx + 6]) < todayStr;
  const canGoPrev = weekStartIdx - 7 >= 0;

  const handleWeekChange = (newDirection) => {
    if (isTransitioning) return;
    
    setDirection(newDirection);
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (newDirection === 'prev' && canGoPrev) {
        setWeekStartIdx(weekStartIdx - 7);
      } else if (newDirection === 'next' && canGoNext) {
        setWeekStartIdx(weekStartIdx + 7);
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setDirection(null);
      }, 300);
    }, 300);
  };

  const getDayHabits = (dateStr) => {
    const completed = [], notCompleted = [];
    for (const habit of habits) {
      const entry = habit.completionHistory.find(e => e.date === dateStr);
      if (entry && entry.completed) completed.push(habit);
      else notCompleted.push(habit);
    }
    return { completed, notCompleted };
  };

  // Fixed day order - manual arrangement for S M T W T F S
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 h-[300px] relative group hover:bg-wax-flower-900/80 transition-colors overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-wax-flower-200">This Week</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => canGoPrev && handleWeekChange('prev')} 
            disabled={!canGoPrev || isTransitioning} 
            className="p-1 hover:bg-wax-flower-500/10 rounded transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-wax-flower-200" />
          </button>
          <span className="text-sm text-wax-flower-300">
            {weekDates[0]?.toLocaleDateString()} - {weekDates[6]?.toLocaleDateString()}
          </span>
          <button 
            onClick={() => canGoNext && handleWeekChange('next')} 
            disabled={!canGoNext || isTransitioning} 
            className="p-1 hover:bg-wax-flower-500/10 rounded transition-colors disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-wax-flower-200" />
          </button>
        </div>
      </div>
      <div className="flex h-[180px] items-end justify-between gap-2 relative mt-6 overflow-hidden">
        <div 
          className={`flex w-full transition-transform duration-300 ease-in-out ${
            isTransitioning && direction === 'prev' ? '-translate-x-full' : 
            isTransitioning && direction === 'next' ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          {dayLabels.map((dayLabel, i) => {
            const date = weekDates[i];
            const dateStr = getDateStr(date);
            const { completed, notCompleted } = getDayHabits(dateStr);
            // Use demo bar heights for now but could use actual completion data
            const percent = barHeights[i];
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group"
                onMouseEnter={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverPos({ x: rect.left + rect.width / 2, y: rect.top });
                  setHovered({ date, completed, notCompleted });
                }}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="w-10 h-[140px] flex items-end">
                  <div 
                    className="w-full rounded-lg transition-transform hover:scale-105 bg-gradient-to-t from-[#FD6A3A] to-[#FF8C6B]" 
                    style={{ height: `${percent}%` }}
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-wax-flower-400">
                  {dayLabel}
                </div>
              </div>
            );
          })}
        </div>
        
        {isTransitioning && (
          <div 
            className={`absolute top-0 left-0 right-0 bottom-0 flex w-full transition-transform duration-300 ease-in-out ${
              direction === 'prev' ? 'translate-x-full' : '-translate-x-full'
            }`}
          >
            {dayLabels.map((dayLabel, i) => {
              const newWeekIdx = direction === 'prev' ? weekStartIdx - 7 : weekStartIdx + 7;
              const newWeekDates = PAST_2_MONTHS.slice(newWeekIdx, newWeekIdx + 7);
              const date = newWeekDates[i];
              const dateStr = date ? getDateStr(date) : '';
              const { completed, notCompleted } = dateStr ? getDayHabits(dateStr) : { completed: [], notCompleted: [] };
              // Use demo bar heights but shifted for visual difference
              const percent = barHeights[(i + 3) % 7];
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className="w-10 h-[140px] flex items-end">
                    <div 
                      className="w-full rounded-lg bg-gradient-to-t from-[#FD6A3A] to-[#FF8C6B]" 
                      style={{ height: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-wax-flower-400">
                    {dayLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {hovered && !isTransitioning && (
          <HoverPopup 
            date={hovered.date} 
            completed={hovered.completed} 
            notCompleted={hovered.notCompleted} 
            position={hoverPos} 
          />
        )}
      </div>
    </div>
  );
};

// --- MONTHLY OVERVIEW ---
const MonthlyOverview = ({ habits }) => {
  const [hovered, setHovered] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleMonthChange = (newDirection) => {
    if (isTransitioning) return;
    
    setDirection(newDirection);
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (newDirection === 'prev') {
        setCurrentMonthOffset(prev => prev - 1);
      } else if (newDirection === 'next' && currentMonthOffset < 0) {
        setCurrentMonthOffset(prev => prev + 1);
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setDirection(null);
      }, 300);
    }, 300);
  };

  const renderMonth = (monthOffset, label) => {
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = base.getDay(); // Sunday start (0-6)
    const blocks = [];
    
    // Add month label
    blocks.push(
      <div key={`label-${monthOffset}`} className="col-span-7 text-sm text-wax-flower-400 mb-2">{label}</div>
    );
    
    // Empty blocks for days before the month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      blocks.push(<div key={`empty-${i}-${monthOffset}`} className="aspect-square rounded-sm w-5 h-5" />);
    }
    
    // Blocks for each day in the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(base.getFullYear(), base.getMonth(), d);
      const dateStr = getDateStr(date);
      const completed = [], notCompleted = [];
      
      for (const habit of habits) {
        const entry = habit.completionHistory.find(e => e.date === dateStr);
        if (entry && entry.completed) completed.push(habit);
        else notCompleted.push(habit);
      }
      
      const percent = completed.length / habits.length;
      blocks.push(
        <div
          key={`${dateStr}-${monthOffset}`}
          className="aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110 w-5 h-5"
          style={{ 
            backgroundColor: percent === 0 ? '#5C100C' : 
                            percent > 0.75 ? '#DC5730' : 
                            percent > 0.5 ? '#BC4528' : 
                            percent > 0.25 ? '#99311D' : '#771E14'
          }}
          onMouseEnter={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverPos({ x: rect.left + rect.width / 2, y: rect.top });
            setHovered({ date, completed, notCompleted });
          }}
          onMouseLeave={() => setHovered(null)}
        />
      );
    }
    return blocks;
  };

  const getMonthLabel = (offset) => {
    const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 h-[300px] relative group hover:bg-wax-flower-900/80 transition-colors overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-wax-flower-200">Monthly Overview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-2 rounded-full hover:bg-wax-flower-800/50 transition-colors"
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-5 w-5 text-wax-flower-200" />
          </button>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-2 rounded-full hover:bg-wax-flower-800/50 transition-colors"
            disabled={isTransitioning || currentMonthOffset >= 0}
          >
            <ChevronRight className="h-5 w-5 text-wax-flower-200" />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className={`grid grid-cols-7 gap-x-1 gap-y-1 auto-rows-min transition-transform duration-300 ${
          isTransitioning ? (direction === 'prev' ? 'translate-x-full' : '-translate-x-full') : ''
        }`}>
          {renderMonth(currentMonthOffset, getMonthLabel(currentMonthOffset))}
        </div>
        
        {isTransitioning && (
          <div className={`absolute top-0 left-0 right-0 transition-transform duration-300 ${
            direction === 'prev' ? 'translate-x-full' : '-translate-x-full'
          }`}>
            <div className="grid grid-cols-7 gap-x-1 gap-y-1 auto-rows-min">
              {renderMonth(
                direction === 'prev' ? currentMonthOffset - 1 : currentMonthOffset + 1,
                getMonthLabel(direction === 'prev' ? currentMonthOffset - 1 : currentMonthOffset + 1)
              )}
            </div>
          </div>
        )}
      </div>
      
      {hovered && <HoverPopup date={hovered.date} completed={hovered.completed} notCompleted={hovered.notCompleted} position={hoverPos} />}
    </div>
  );
};

// --- HABIT CARD ---
const HabitCard = ({ habit, expanded, onToggle }) => {
  const getStreakColor = (streak) => {
    if (streak >= 7) return 'bg-gradient-to-r from-green-800 to-green-600';
    if (streak >= 3) return 'bg-gradient-to-r from-yellow-700 to-yellow-500';
    return 'bg-gradient-to-r from-red-800 to-red-600';
  };

  return (
    <div className={cn(
      "bg-wax-flower-950/20 rounded-xl mb-2 transition-colors flex flex-col hover:bg-wax-flower-900/40",
      expanded && "shadow-lg"
    )}>
      <div className="flex items-center px-4 py-3 gap-6">
        {/* Left section: Habit Name and Goal */}
        <div className="flex-1 min-w-[180px]">
          <div className="text-lg font-bold text-wax-flower-200">{truncate(habit.name, 20)}</div>
          <div className="text-xs text-wax-flower-400">{truncate(habit.goalName, 18)}</div>
        </div>
        
        {/* Middle-left: Streak Indicator */}
        <div className="flex flex-col items-start min-w-[120px]">
          <span className="text-sm font-medium text-wax-flower-300 mb-2">Streak</span>
          <div className="flex items-center gap-2 w-full">
            <div className="w-16 h-2.5 rounded-full bg-wax-flower-800 overflow-hidden">
              <div className={cn("h-full rounded-full", getStreakColor(habit.streak))} />
            </div>
            <span className="text-sm font-bold text-wax-flower-200 whitespace-nowrap">{habit.streak} D</span>
          </div>
        </div>
        
        {/* Middle-right: Progress */}
        <div className="flex flex-col items-start min-w-[120px]">
          <span className="text-sm font-medium text-wax-flower-300 mb-2">Progress</span>
          <div className="flex items-center gap-2 w-full">
            <div className="w-16 h-2.5 rounded-full bg-wax-flower-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B]" style={{ width: habit.progress + '%' }} />
            </div>
            <span className="text-lg font-bold text-wax-flower-200 whitespace-nowrap">{habit.progress}%</span>
          </div>
        </div>
        
        {/* Right: Dropdown button */}
        <button onClick={onToggle} className="p-2 rounded-full hover:bg-wax-flower-500/10 transition-transform ml-2">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-6 w-6 text-wax-flower-200" />
          </motion.div>
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-4 pb-3"
          >
            <div className="p-4 bg-wax-flower-950/30 rounded-b-xl">
              <p className="text-sm text-wax-flower-400">Detailed analytics coming soon…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- GOAL CARD ---
const GoalCard = ({ goal, expanded, onToggle }) => {
  const getHealthColor = (health) => {
    if (health > 75) return 'bg-gradient-to-r from-green-800 to-green-600';
    if (health > 50) return 'bg-gradient-to-r from-yellow-700 to-yellow-500';
    return 'bg-gradient-to-r from-red-800 to-red-600';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-red-300';
    if (priority === 'Medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className={cn(
      "bg-wax-flower-950/20 rounded-xl mb-2 transition-colors flex flex-col hover:bg-wax-flower-900/40",
      expanded && "shadow-lg"
    )}>
      <div className="flex items-center px-4 py-3 gap-6">
        {/* Left: Goal Name and Habit Count */}
        <div className="flex-1 min-w-[180px]">
          <div className="text-lg font-bold text-wax-flower-200">{truncate(goal.name, 18)}</div>
          <div className="text-xs text-wax-flower-400">{goal.habitCount} habits</div>
        </div>
        
        {/* Middle: Health Indicator */}
        <div className="flex flex-col items-start min-w-[120px]">
          <span className="text-sm font-medium text-wax-flower-300 mb-2">Health</span>
          <div className="flex items-center gap-2 w-full">
            <div className="w-16 h-2.5 rounded-full bg-wax-flower-800 overflow-hidden">
              <div className={cn("h-full rounded-full", getHealthColor(goal.health))} />
            </div>
          </div>
        </div>
        
        {/* Right: Priority */}
        <div className="flex flex-col items-start min-w-[80px]">
          <span className="text-sm font-medium text-wax-flower-300 mb-2">Priority</span>
          <span className={cn("text-base font-bold", getPriorityColor(goal.priority))}>{goal.priority}</span>
        </div>
        
        {/* Dropdown button */}
        <button onClick={onToggle} className="p-2 rounded-full hover:bg-wax-flower-500/10 transition-transform ml-2">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-6 w-6 text-wax-flower-200" />
          </motion.div>
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-4 pb-3"
          >
            <div className="p-4 bg-wax-flower-950/30 rounded-b-xl">
              <p className="text-sm text-wax-flower-400">Detailed goal analytics coming soon…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN ANALYTICS PAGE ---
export default function Analytics() {
  const [expandedHabit, setExpandedHabit] = useState(null);
  const [expandedGoal, setExpandedGoal] = useState(null);
  
  // Sort goals by priority
  const sortedGoals = [...DEMO_GOALS].sort((a, b) => {
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="p-6 space-y-6">
      <style jsx="true" global="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(42, 42, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FD6A3A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fd825b;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(42, 42, 42, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #FD6A3A;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #fd825b;
        }
      `}</style>
      
      {/* Top row: This Week and Monthly Overview */}
      <div className="grid grid-cols-2 gap-6">
        <WeeklyOverview habits={DEMO_HABITS_WITH_HISTORY} />
        <MonthlyOverview habits={DEMO_HABITS_WITH_HISTORY} />
      </div>
      
      {/* Middle: Your Habits */}
      <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 h-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-wax-flower-200">Your Habits</span>
        </div>
        <div className="overflow-y-auto max-h-[330px] custom-scrollbar">
          {DEMO_HABITS_WITH_HISTORY.map(habit => (
            <HabitCard
              key={habit._id}
              habit={habit}
              expanded={expandedHabit === habit._id}
              onToggle={() => setExpandedHabit(expandedHabit === habit._id ? null : habit._id)}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom: Your Goals */}
      <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 h-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-wax-flower-200">Your Goals</span>
        </div>
        <div className="overflow-y-auto max-h-[330px] custom-scrollbar">
          {sortedGoals.map(goal => (
            <GoalCard
              key={goal._id}
              goal={goal}
              expanded={expandedGoal === goal._id}
              onToggle={() => setExpandedGoal(expandedGoal === goal._id ? null : goal._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 