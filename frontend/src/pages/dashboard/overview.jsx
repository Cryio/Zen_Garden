import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { 
  Check,
  BarChart2,
  Calendar,
  Clock,
  Plus,
  Activity,
  X,
  Filter,
  XCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy data for habits
const todaysHabits = [
  { id: 1, name: "Morning Meditation", status: null },
  { id: 2, name: "Breakfast", status: null },
  { id: 3, name: "Read 30 mins", status: null },
  { id: 4, name: "Exercise", status: null },
  { id: 5, name: "Study Mathematics", status: null },
  { id: 6, name: "Practice Programming", status: null },
  { id: 7, name: "Evening Walk", status: null },
  { id: 8, name: "Journal Writing", status: null },
  { id: 9, name: "Water Plants", status: null },
  { id: 10, name: "Language Practice", status: null },
  { id: 11, name: "Stretching", status: null },
  { id: 12, name: "Plan Tomorrow", status: null },
];

// Update weekly data structure
const weeklyData = [
  { day: "M", completed: 8, total: 12 },
  { day: "T", completed: 10, total: 12 },
  { day: "W", completed: 7, total: 12 },
  { day: "T", completed: 11, total: 12 },
  { day: "F", completed: 9, total: 12 },
  { day: "S", completed: 12, total: 12 },
  { day: "S", completed: 6, total: 12 }
];

// Update monthly data structure for better visualization
const monthlyData = Array(35).fill(null).map((_, i) => ({
  date: new Date(Date.now() - (34 - i) * 24 * 60 * 60 * 1000),
  completed: Math.floor(Math.random() * 12),
  total: 12,
  isFuture: i > 28 // Assuming current month has 28 days passed
}));

const allHabits = [
  { id: 1, name: "Eat", progress: 74, streak: 8 },
  { id: 2, name: "Sleep", progress: 51, streak: 7 },
  { id: 3, name: "Geography", progress: 30, streak: 1 },
  { id: 4, name: "Maths", progress: 89, streak: 13 },
  { id: 5, name: "Gym", progress: 44, streak: 8 },
  // Add more habits here
];

export default function Overview() {
  const [habits, setHabits] = useState(todaysHabits);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitFilter, setHabitFilter] = useState('newest');
  
  const completedHabits = habits.filter(h => h.status === 'completed').length;
  const totalHabits = habits.length;

  const handleHabitStatus = (id, status) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        return { ...habit, status: status };
      }
      return habit;
    }).sort((a, b) => {
      // Move completed items to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    }));
  };

  const features = [
    {
      header: (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Today's Habits</h2>
            </div>
            <span className="text-base text-wax-flower-300">{completedHabits} out of {totalHabits} habits completed</span>
          </div>
          
          <div className="flex gap-6 h-[300px]">
            <div className="flex-grow max-h-full overflow-y-auto pr-4 custom-scrollbar">
              <AnimatePresence>
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between border-b border-wax-flower-700/30 py-3"
                  >
                    <div className="text-base font-medium text-wax-flower-200">{habit.name}</div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleHabitStatus(habit.id, 'skipped')}
                        className={cn(
                          "p-1 rounded transition-colors",
                          habit.status === 'skipped' ? "bg-red-500/20" : "hover:bg-red-500/10"
                        )}
                      >
                        <X className={cn(
                          "h-5 w-5",
                          habit.status === 'skipped' ? "text-red-500" : "text-wax-flower-400"
                        )} />
                      </button>
                      <button
                        onClick={() => handleHabitStatus(habit.id, 'completed')}
                        className={cn(
                          "p-1 rounded transition-colors",
                          habit.status === 'completed' ? "bg-[#FD6A3A]/20" : "hover:bg-[#FD6A3A]/10"
                        )}
                      >
                        <Check className={cn(
                          "h-5 w-5",
                          habit.status === 'completed' ? "text-[#FD6A3A]" : "text-wax-flower-400"
                        )} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="w-1/3 min-w-[200px] flex items-center justify-center">
              <div className="w-56 h-56 relative min-w-[200px] min-h-[200px]">
                <div
                  className="w-full h-full rounded-full relative overflow-hidden"
                  style={{
                    background: 'radial-gradient(circle at center, #2a2a2a 0%, #1a1a1a 100%)',
                    boxShadow: '0 0 20px rgba(253, 106, 58, 0.2)'
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ rotate: 0 }}
                    animate={{ 
                      background: `conic-gradient(#D9D9D9 ${(completedHabits / totalHabits) * 360}deg, transparent 0deg)`
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  {completedHabits === 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(180deg, #FD6A3A 50%, transparent 50%)',
                        clipPath: 'polygon(50% 0, 51% 0, 51% 50%, 50% 50%)',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      className: "col-span-full",
    },
    {
      header: (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">This Week</h2>
            </div>
          </div>
          
          <div className="relative h-[180px] px-2 pb-8">
            <div className="absolute inset-0 flex items-end justify-between pt-4">
              {weeklyData.map((day, i) => (
                <div key={i} className="group relative flex flex-col items-center" style={{ width: '10%' }}>
                  <motion.div
                    className="w-full bg-[#FD6A3A] rounded-sm hover:opacity-80 transition-all cursor-pointer"
                    style={{ 
                      height: `${Math.max((day.completed / day.total) * 140, 4)}px`,
                      minHeight: '4px'
                    }}
                    whileHover={{ y: -5 }}
                  />
                  <div className="absolute -bottom-8 text-sm font-bold text-white">
                    {day.day}
                  </div>
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-wax-flower-800 text-wax-flower-200 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {day.completed} of {day.total} habits
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      className: "col-span-4",
    },
    {
      header: (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Monthly Overview</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-[2px] h-[180px] p-2">
            {monthlyData.map((day, i) => {
              let bgColor = '#D9D9D9'; // 0%
              if (day.isFuture) {
                bgColor = '#817A87'; // Future days
              } else if (day.completed > 0) {
                const percentage = (day.completed / day.total) * 100;
                if (percentage >= 75) bgColor = '#297A27';
                else if (percentage >= 50) bgColor = '#46A744';
                else if (percentage >= 25) bgColor = '#8EC66B';
                else bgColor = '#D5E68A';
              }
              
              return (
                <div
                  key={i}
                  className="group relative"
                  style={{ 
                    aspectRatio: '1/1',
                    backgroundColor: bgColor,
                    borderRadius: '35%',
                    transition: 'background-color 0.3s ease',
                    width: '20px',
                    height: '20px',
                    margin: 'auto'
                  }}
                >
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-wax-flower-800 text-wax-flower-200 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {day.date.toLocaleDateString()}: {day.completed} of {day.total} habits
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      className: "col-span-8",
    },
    {
      header: (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">All Habits</h2>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#FD6A3A]" />
              <select
                className="bg-transparent text-wax-flower-300 border-none outline-none cursor-pointer appearance-none px-2 py-1 rounded hover:bg-[#FD6A3A]/10 focus:bg-[#FD6A3A]/10"
                value={habitFilter}
                onChange={(e) => setHabitFilter(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FD6A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                  paddingRight: '2rem'
                }}
              >
                <option value="newest" className="bg-wax-flower-900 text-wax-flower-300">Newest</option>
                <option value="oldest" className="bg-wax-flower-900 text-wax-flower-300">Oldest</option>
                <option value="longest" className="bg-wax-flower-900 text-wax-flower-300">Longest Streak</option>
                <option value="shortest" className="bg-wax-flower-900 text-wax-flower-300">Shortest Streak</option>
              </select>
            </div>
          </div>
          
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="text-left text-wax-flower-300">
                <tr>
                  <th className="py-2 w-1/3">Habit</th>
                  <th className="py-2 w-1/3">Progress</th>
                  <th className="py-2 w-1/3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {allHabits.map((habit) => (
                  <tr key={habit.id} className="border-b border-wax-flower-700/30">
                    <td className="py-3 text-base font-medium text-wax-flower-200">{habit.name}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-wax-flower-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FD6A3A]"
                            style={{ width: `${habit.progress}%` }}
                          />
                        </div>
                        <span className="text-wax-flower-300">{habit.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-wax-flower-300">{habit.streak} day streak</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
      className: "col-span-full",
    },
    {
      header: (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Add Habit</h2>
            </div>
          </div>
          <div className="flex items-center justify-center h-[220px]">
            <Plus className="h-12 w-12 text-[#FD6A3A]" />
          </div>
        </div>
      ),
      className: "col-span-6",
    },
    {
      header: (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Focus Streaks</h2>
            </div>
          </div>
          
          <div className="flex flex-col justify-center h-[220px] space-y-6 px-4">
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Max:</div>
              <div className="text-xl font-semibold text-wax-flower-200">9 hr 32 min</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Avg:</div>
              <div className="text-xl font-semibold text-wax-flower-200">80% completion</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Last:</div>
              <div className="text-xl font-semibold text-wax-flower-200">2 hr</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Streak:</div>
              <div className="text-xl font-semibold text-wax-flower-200">90</div>
            </div>
          </div>
        </div>
      ),
      className: "col-span-6",
    },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200">Dashboard</h1>
          <p className="text-base text-wax-flower-300">Welcome [User Name], here is your</p>
        </div>
      </div>

      <style jsx global>{`
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
        
        /* Main page scrollbar */
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

      <div className="grid grid-cols-12 gap-4">
        {features.map((feature, i) => (
          <div key={i} className={cn(feature.className, "bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-4 hover:border-wax-flower-600/50")}>
            {feature.header}
          </div>
        ))}
      </div>
    </div>
  );
} 