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

// --- WEEKLY OVERVIEW ---
const WeeklyOverview = ({ habits }) => {
  const [weekStartIdx, setWeekStartIdx] = useState(PAST_2_MONTHS.length - 7);
  const [hovered, setHovered] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const weekDates = PAST_2_MONTHS.slice(weekStartIdx, weekStartIdx + 7);
  const todayStr = getDateStr(new Date());
  const canGoNext = weekStartIdx + 7 < PAST_2_MONTHS.length && getDateStr(PAST_2_MONTHS[weekStartIdx + 6]) < todayStr;
  const canGoPrev = weekStartIdx - 7 >= 0;

  const getDayHabits = (dateStr) => {
    const completed = [], notCompleted = [];
    for (const habit of habits) {
      const entry = habit.completionHistory.find(e => e.date === dateStr);
      if (entry && entry.completed) completed.push(habit);
      else notCompleted.push(habit);
    }
    return { completed, notCompleted };
  };

  const Popout = hovered && (
    <div
      className="fixed z-50 min-w-[220px] max-w-xs max-h-60 overflow-y-auto rounded-xl shadow-lg border border-wax-flower-700/30 bg-wax-flower-900/95 p-4"
      style={{
        left: hoverPos.x - 40,
        top: hoverPos.y - 120,
      }}
    >
      <div className="text-wax-flower-200 font-semibold mb-2 text-center">
        {hovered.date.toLocaleDateString()}
      </div>
      <div className="space-y-1">
        {hovered.completed.map(h => (
          <div key={h._id} className="bg-green-900/80 text-green-300 rounded px-2 py-1 text-sm">
            ✓ {truncate(h.name)}
          </div>
        ))}
        {hovered.notCompleted.map(h => (
          <div key={h._id} className="bg-red-900/80 text-red-300 rounded px-2 py-1 text-sm">
            ✗ {truncate(h.name)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 h-[300px] relative group hover:bg-wax-flower-900/80 transition-colors overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-wax-flower-200">This Week</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => canGoPrev && setWeekStartIdx(weekStartIdx - 7)} disabled={!canGoPrev} className="p-1 hover:bg-wax-flower-500/10 rounded transition-colors disabled:opacity-50">
            <ChevronLeft className="h-5 w-5 text-wax-flower-200" />
          </button>
          <span className="text-sm text-wax-flower-300">
            {weekDates[0]?.toLocaleDateString()} - {weekDates[6]?.toLocaleDateString()}
          </span>
          <button onClick={() => canGoNext && setWeekStartIdx(weekStartIdx + 7)} disabled={!canGoNext} className="p-1 hover:bg-wax-flower-500/10 rounded transition-colors disabled:opacity-50">
            <ChevronRight className="h-5 w-5 text-wax-flower-200" />
          </button>
        </div>
      </div>
      <div className="flex h-[180px] items-end gap-2 relative">
        {weekDates.map((date, i) => {
          const dateStr = getDateStr(date);
          const { completed, notCompleted } = getDayHabits(dateStr);
          const percent = completed.length / habits.length * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group"
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverPos({ x: rect.left + rect.width / 2, y: rect.top });
                setHovered({ date, completed, notCompleted });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-7 h-full flex items-end">
                <div className="w-full rounded-lg transition-transform hover:scale-105 bg-gradient-to-t from-[#FD6A3A] to-[#FF8C6B]" style={{ height: `${percent}%`, opacity: percent ? 0.8 : 0.3 }} />
              </div>
              <div className="mt-2 text-sm font-medium text-wax-flower-400">
                {date.toLocaleDateString('en-US', { weekday: 'short' })[0]}
              </div>
            </div>
          );
        })}
        {Popout}
      </div>
    </div>
  );
};

// --- MONTHLY OVERVIEW ---
const MonthlyOverview = ({ habits }) => {
  const [hovered, setHovered] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renderMonth = (monthOffset) => {
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = (base.getDay() + 6) % 7; // Monday start
    const blocks = [];
    for (let i = 0; i < firstDayOfWeek; i++) blocks.push(<div key={`empty-${i}`} className="aspect-square rounded-sm" />);
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
          key={dateStr}
          className="aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110"
          style={{ backgroundColor: percent === 0 ? '#5C100C' : percent > 0.75 ? '#DC5730' : percent > 0.5 ? '#BC4528' : percent > 0.25 ? '#99311D' : '#771E14' }}
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

  const Popout = hovered && (
    <div
      className="fixed z-50 min-w-[220px] max-w-xs max-h-60 overflow-y-auto rounded-xl shadow-lg border border-wax-flower-700/30 bg-wax-flower-900/95 p-4"
      style={{
        left: hoverPos.x - 40,
        top: hoverPos.y - 120,
      }}
    >
      <div className="text-wax-flower-200 font-semibold mb-2 text-center">
        {hovered.date.toLocaleDateString()}
      </div>
      <div className="space-y-1">
        {hovered.completed.map(h => (
          <div key={h._id} className="bg-green-900/80 text-green-300 rounded px-2 py-1 text-sm">
            ✓ {truncate(h.name)}
          </div>
        ))}
        {hovered.notCompleted.map(h => (
          <div key={h._id} className="bg-red-900/80 text-red-300 rounded px-2 py-1 text-sm">
            ✗ {truncate(h.name)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 h-[300px] relative group hover:bg-wax-flower-900/80 transition-colors">
      <h2 className="text-xl font-bold text-wax-flower-200 mb-6">Monthly Overview</h2>
      <div className="grid grid-cols-7 gap-1">
        {renderMonth(-1)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {renderMonth(0)}
      </div>
      {Popout}
    </div>
  );
};

// --- HABIT CARD ---
const HabitCard = ({ habit, expanded, onToggle }) => (
  <div className={cn(
    "bg-wax-flower-950/20 rounded-xl mb-2 transition-colors flex flex-col hover:bg-wax-flower-900/40",
    expanded && "shadow-lg"
  )}>
    <div className="flex items-center px-4 py-3 gap-4">
      {/* Habit Name */}
      <div className="flex-1 min-w-[120px]">
        <div className="text-lg font-bold text-wax-flower-200">{truncate(habit.name, 18)}</div>
        <div className="text-xs text-wax-flower-400">{truncate(habit.goalName, 16)}</div>
      </div>
      {/* Streak */}
      <div className="flex flex-col items-center min-w-[70px]">
        <span className="text-xs text-wax-flower-400 mb-1">Streak</span>
        <div className="flex items-center gap-2">
          <div className={cn("rounded-full h-5 w-10 flex items-center", streakColor(habit.streak), "px-2 text-xs text-white font-semibold justify-center")}>{habit.streak} D</div>
        </div>
      </div>
      {/* Progress */}
      <div className="flex flex-col items-center min-w-[110px]">
        <span className="text-xs text-wax-flower-400 mb-1">Progress</span>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-2 rounded bg-wax-flower-800 overflow-hidden">
            <div className="h-2 rounded bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B]" style={{ width: habit.progress + '%' }} />
          </div>
          <span className="text-xs text-wax-flower-200 font-semibold ml-2">{habit.progress}%</span>
        </div>
      </div>
      {/* Dropdown */}
      <button onClick={onToggle} className="ml-4 p-2 rounded-full hover:bg-wax-flower-500/10 transition-transform">
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-wax-flower-200" />
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

// --- MAIN ANALYTICS PAGE ---
export default function Analytics() {
  const [expandedHabit, setExpandedHabit] = useState(null);
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
      <div className="grid grid-cols-2 gap-6">
        <WeeklyOverview habits={DEMO_HABITS_WITH_HISTORY} />
        <MonthlyOverview habits={DEMO_HABITS_WITH_HISTORY} />
      </div>
      <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-wax-flower-200">Your Habits</span>
        </div>
        <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
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
    </div>
  );
} 