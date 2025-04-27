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
  XCircle,
  ChevronRight,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Dummy data for habits
const todaysHabits = [
  { id: 1, name: "Morning Meditation", status: null, category: "mindfulness" },
  { id: 2, name: "Breakfast", status: null, category: "health" },
  { id: 3, name: "Read 30 mins", status: null, category: "learning" },
  { id: 4, name: "Exercise", status: null, category: "health" },
  { id: 5, name: "Study Mathematics", status: null, category: "learning" },
  { id: 6, name: "Practice Programming", status: null, category: "learning" },
  { id: 7, name: "Evening Walk", status: null, category: "health" },
  { id: 8, name: "Journal Writing", status: null, category: "mindfulness" },
  { id: 9, name: "Water Plants", status: null, category: "self-care" },
  { id: 10, name: "Language Practice", status: null, category: "learning" },
  { id: 11, name: "Stretching", status: null, category: "health" },
  { id: 12, name: "Plan Tomorrow", status: null, category: "productivity" },
];

// Update weekly data processing
const processWeeklyData = (habits) => {
  const weeklyData = Array(7).fill().map(() => ({
    completed: 0,
    total: habits.length,
    habits: []
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  habits.forEach(habit => {
    if (habit.completionHistory && Array.isArray(habit.completionHistory)) {
      // Process last 7 days of history
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const historyEntry = habit.completionHistory.find(entry => entry.date === dateStr);
        if (historyEntry && historyEntry.completed) {
          weeklyData[i].completed++;
          weeklyData[i].habits.push({
            _id: habit._id,
            name: habit.name,
            completed: true
          });
        }
      }
    }
  });

  return weeklyData;
};

// Update monthly data processing
const processMonthlyData = (habits) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const firstDayOfMonthWeekday = (startOfMonth.getDay() + 6) % 7;

  const monthlyData = [];

  // Add leading empty cells
  for (let i = 0; i < firstDayOfMonthWeekday; i++) {
    monthlyData.push({ key: `empty-start-${i}`, isEmpty: true });
  }

  // Process each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    const completedHabits = habits.filter(habit => {
      if (!habit.completionHistory) return false;
      return habit.completionHistory.some(entry => entry.date === dateStr && entry.completed);
    });

    monthlyData.push({
      key: dateStr,
      date: date,
      completed: completedHabits.length,
      total: habits.length,
      isFuture: date > today,
      isToday: date.toDateString() === today.toDateString(),
      habits: completedHabits
    });
  }

  return monthlyData;
};

const allHabits = [
  { id: 1, name: "Eat", progress: 74, streak: 8, category: "health" },
  { id: 2, name: "Sleep", progress: 51, streak: 7, category: "health" },
  { id: 3, name: "Geography", progress: 30, streak: 1, category: "learning" },
  { id: 4, name: "Maths", progress: 89, streak: 13, category: "learning" },
  { id: 5, name: "Gym", progress: 44, streak: 8, category: "health" },
  // Add more habits here
];

// Motivational quotes (hardcoded, simple English)
const motivationalQuotes = [
  "Small steps every day lead to big results.",
  "Stay consistent, success will follow.",
  "You don't have to be perfect, just keep going.",
  "Progress, not perfection.",
  "Every day is a fresh start."
];

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [loadingAll, setLoadingAll] = useState(true);
  const [fetchedTodaysHabits, setFetchedTodaysHabits] = useState([]);
  const [fetchedWeeklyData, setFetchedWeeklyData] = useState([]);
  const [fetchedMonthlyData, setFetchedMonthlyData] = useState([]);
  const [fetchedAllHabits, setFetchedAllHabits] = useState([]);
  const [fetchedGoalsWithStats, setFetchedGoalsWithStats] = useState([]);
  const [focusStreaks, setFocusStreaks] = useState({ max: 'N/A', avg: 'N/A', last: 'N/A', streak: 0 });
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(true);
  const [error, setError] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * motivationalQuotes.length));
  
  const completedHabitsToday = fetchedTodaysHabits.filter(h => h.completed).length;
  const totalHabitsToday = fetchedTodaysHabits.length;

  const navigateToGoal = (goalId) => {
    navigate(`/dashboard/habits`);
  };

  const handleHabitStatus = async (id, newStatus) => {
    const originalHabits = [...fetchedTodaysHabits];
    
    try {
      const habit = fetchedTodaysHabits.find(h => h._id === id);
      if (!habit) {
        console.error(`Habit with ID ${id} not found in fetchedTodaysHabits:`, fetchedTodaysHabits);
        throw new Error('Habit not found in local state');
      }

      const updatedHabits = fetchedTodaysHabits.map(h => {
        if (h._id === id) {
          const isCompleted = newStatus === 'completed';
          return { ...h, completed: isCompleted, status: newStatus };
        }
        return h;
      }).sort((a, b) => {
        const statusA = a.status || (a.completed ? 'completed' : null);
        const statusB = b.status || (b.completed ? 'completed' : null);
        if (statusA === 'completed' && statusB !== 'completed') return 1;
        if (statusA !== 'completed' && statusB === 'completed') return -1;
        return 0;
      });
      
      setFetchedTodaysHabits(updatedHabits);

      console.log('Updating habit status:', {
        habitId: id,
        userId: user._id,
        completed: newStatus === 'completed',
        goalId: habit.goalId
      });

      const response = await api.put(`/api/habits/${user._id}/habits/${id}`, { 
        completed: newStatus === 'completed',
        goalId: habit.goalId
      });

      console.log('Habit status update response:', response);
      
      toast.success(`Habit marked as ${newStatus}!`, {
        style: {
          background: '#363636',
          color: '#fff',
        },
        duration: 3000,
      });
      
      await fetchData();
    } catch (err) {
      console.error("Failed to update habit status:", err);
      console.error("Error details:", err.response?.data || err.message);
      
      setFetchedTodaysHabits(originalHabits);
      
      toast.error(err.message || "Failed to update habit status", {
        style: {
          background: '#363636',
          color: '#fff',
        },
        duration: 5000,
      });
    }
  };

  // Function to refresh the quote (not repeating the current one)
  const refreshQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (newIndex === quoteIndex && motivationalQuotes.length > 1);
    setQuoteIndex(newIndex);
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
            <span className="text-base text-wax-flower-300">{completedHabitsToday} out of {totalHabitsToday} habits completed</span>
          </div>
          
          <div className="flex gap-6 h-[300px]">
            <div className="flex-grow max-h-full overflow-y-auto pr-4 custom-scrollbar">
              <AnimatePresence>
                {loadingToday ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-wax-flower-500" />
                  </div>
                ) : fetchedTodaysHabits.length > 0 ? (
                  fetchedTodaysHabits.map((habit) => (
                    <motion.div
                      key={habit._id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between border-b border-wax-flower-700/30 py-3 group cursor-pointer hover:bg-wax-flower-900/50 transition-colors duration-150"
                      onClick={(e) => {
                        if (e.target.closest('button')) return;
                        navigateToGoal(habit.goalId);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          habit.category === 'health' ? 'bg-green-500' :
                          habit.category === 'learning' ? 'bg-blue-500' :
                          habit.category === 'mindfulness' ? 'bg-purple-500' :
                          habit.category === 'productivity' ? 'bg-yellow-500' :
                          habit.category === 'self-care' ? 'bg-pink-500' :
                          habit.category === 'finance' ? 'bg-teal-500' :
                          habit.category === 'social' ? 'bg-indigo-500' :
                          habit.category === 'organization' ? 'bg-gray-500' :
                          habit.category === 'hobby' ? 'bg-orange-500' :
                          'bg-gray-400'
                        )} />
                        <div className="text-base font-medium text-wax-flower-200 group-hover:text-[#FD6A3A] transition-colors">
                          {habit.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHabitStatus(habit._id, 'skipped');
                          }}
                          className={cn(
                            "p-1 rounded transition-colors",
                            habit.status === 'skipped' ? "bg-red-500/20" : "hover:bg-red-500/10"
                          )}
                          title="Mark as skipped"
                        >
                          <X className={cn(
                            "h-5 w-5",
                            habit.status === 'skipped' ? "text-red-500" : "text-wax-flower-400"
                          )} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHabitStatus(habit._id, 'completed');
                          }}
                          className={cn(
                            "p-1 rounded transition-colors",
                            habit.completed ? "bg-[#FD6A3A]/20" : "hover:bg-[#FD6A3A]/10"
                          )}
                          title="Mark as completed"
                        >
                          <Check className={cn(
                            "h-5 w-5",
                            habit.completed ? "text-[#FD6A3A]" : "text-wax-flower-400"
                          )} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full text-wax-flower-400">
                    No habits scheduled for today.
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="w-1/3 min-w-[200px] flex items-center justify-center">
              <div className="w-56 h-56 relative min-w-[200px] min-h-[200px]">
                <motion.div
                  className="w-full h-full rounded-full relative overflow-hidden"
                  style={{
                    background: 'radial-gradient(circle at center, #2a2a2a 0%, #1a1a1a 100%)',
                    boxShadow: '0 0 20px rgba(253, 106, 58, 0.2)'
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at center, #FD6A3A 0%, #FF8C6B 100%)',
                      borderRadius: '50%',
                      transformOrigin: 'center'
                    }}
                    animate={{
                      scale: [(completedHabitsToday / totalHabitsToday) * 0.8, (completedHabitsToday / totalHabitsToday) * 0.9, (completedHabitsToday / totalHabitsToday) * 0.8],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at center, transparent 60%, rgba(253, 106, 58, 0.1) 100%)',
                      borderRadius: '50%'
                    }}
                    animate={{
                      scale: [1, 1.02, 1],
                      opacity: [0.5, 0.7, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, #FD6A3A 50%, transparent 50%)',
                      clipPath: 'polygon(50% 0, 51% 0, 51% 50%, 50% 50%)',
                      borderRadius: '50%'
                    }}
                    animate={{
                      rotate: [0, 360],
                      transition: { duration: 4, repeat: Infinity, ease: "linear" }
                    }}
                  />
                  {completedHabitsToday === 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(180deg, #FD6A3A 50%, transparent 50%)',
                        clipPath: 'polygon(50% 0, 51% 0, 51% 50%, 50% 50%)',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.02, 1],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <span className="text-2xl font-bold text-wax-flower-200">
                    {Math.round((completedHabitsToday / totalHabitsToday) * 100)}%
                  </span>
                </motion.div>
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
              {fetchedWeeklyData.map((day, i) => (
                <div key={i} className="group relative flex flex-col items-center" style={{ width: '10%' }}>
                  <motion.div
                    className="w-full rounded-t-md hover:opacity-80 transition-all cursor-pointer"
                    style={{ 
                      height: `${Math.max((day.completed / day.total) * 140, 6)}px`,
                      minHeight: '6px',
                      background: `linear-gradient(to top, #FD6A3A, #FF8C6B)`
                    }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: '0 0 15px rgba(253, 106, 58, 0.4)'
                    }}
                  />
                  <div className="absolute -bottom-4 text-sm font-bold text-wax-flower-200">
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
            {fetchedMonthlyData.map((day, i) => {
              let bgColor = '#D9D9D9';
              if (day.isFuture) {
                bgColor = '#817A87';
              } else if (day.completed > 0) {
                const percentage = (day.completed / day.total) * 100;
                if (percentage >= 75) bgColor = '#297A27';
                else if (percentage >= 50) bgColor = '#46A744';
                else if (percentage >= 25) bgColor = '#8EC66B';
                else bgColor = '#D5E68A';
              }
              
              return (
                <motion.div
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
                  whileHover={{ scale: 1.2 }}
                >
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-wax-flower-800 text-wax-flower-200 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {day.date.toLocaleDateString()}: {day.completed} of {day.total} habits
                  </div>
                </motion.div>
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
              <h2 className="text-xl font-bold text-wax-flower-200">All Goals</h2>
            </div>
          </div>
          
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {loadingGoals ? (
               <div className="flex justify-center items-center h-[200px]">
                 <Loader2 className="h-8 w-8 animate-spin text-wax-flower-500" />
               </div>
            ) : fetchedGoalsWithStats.length > 0 ? (
              <table className="w-full">
                <thead className="text-left text-wax-flower-300">
                  <tr>
                    <th className="py-2 pl-2 w-2/3">Goal</th>
                    <th className="py-2 pr-2 w-1/3 text-right">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedGoalsWithStats.map((goal) => (
                    <tr 
                      key={goal._id} 
                      className="border-b border-wax-flower-700/30 group cursor-pointer hover:bg-wax-flower-900/50 transition-colors duration-150"
                      onClick={() => navigateToGoal(goal._id)}
                    >
                      <td className="py-3 pl-2">
                        <div className="text-base font-medium text-wax-flower-200 group-hover:text-[#FD6A3A] transition-colors">
                          {goal.name}
                        </div>
                        <div className="text-xs text-wax-flower-400 truncate">
                            {goal.description || 'No description'}
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={goal.completionRate || 0} className="h-2 w-96" />
                          <span className="text-wax-flower-300 text-sm w-10 text-right">{Math.round(goal.completionRate || 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             ) : (
               <div className="flex justify-center items-center h-[200px] text-wax-flower-400">
                  No goals found. Add some goals and habits!
               </div>
            )}
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
          <div className="flex flex-col items-center justify-center h-[220px] space-y-4">
            <motion.div
              className="w-24 h-24 rounded-full bg-[#FD6A3A]/10 flex items-center justify-center cursor-pointer hover:bg-[#FD6A3A]/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="h-12 w-12 text-[#FD6A3A]" />
            </motion.div>
            
            <button
              onClick={async () => {
                try {
                  setLoadingAll(true);
                  console.log('User ID:', user?._id);
                  console.log('API Request to:', '/api/seed/sample-data');
                  console.log('Token:', localStorage.getItem('token'));
                  
                  const seedResponse = await api.post('/api/seed/sample-data');
                  console.log('Sample data response:', seedResponse);
                  
                  toast.success('Sample habits and goals added!', {
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    duration: 3000,
                  });
                  
                  // Refresh data
                  fetchData();
                } catch (err) {
                  console.error("Failed to add sample data:", err);
                  console.error("Error details:", err.response?.data || err.message);
                  toast.error("Failed to add sample data", {
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    duration: 5000,
                  });
                } finally {
                  setLoadingAll(false);
                }
              }}
              className="text-wax-flower-300 hover:text-wax-flower-200 underline text-sm"
            >
              Add sample data
            </button>
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

  useEffect(() => {
    if (!user?._id) {
      setFetchedTodaysHabits([]);
      setFetchedWeeklyData([]);
      setFetchedMonthlyData([]);
      setFetchedAllHabits([]);
      setFetchedGoalsWithStats([]);
      setFocusStreaks({ max: 'N/A', avg: 'N/A', last: 'N/A', streak: 0 });
      setLoadingToday(true);
      setLoadingWeek(true);
      setLoadingMonth(true);
      setLoadingAll(true);
      setLoadingGoals(true);
      setLoadingStreaks(true);
      setError(null);
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    setError(null);
    setLoadingToday(true);
    setLoadingWeek(true);
    setLoadingMonth(true);
    setLoadingAll(true);
    setLoadingGoals(true);
    setLoadingStreaks(true);
    try {
      // Fetch goals with populated habits
      const goalsRes = await api.get(`/api/habits/${user._id}/habits`);
      const goalsData = goalsRes.data || [];

      // Process goals and get all habits
      const allActualHabits = goalsData.reduce((acc, goal) => {
        const habits = goal.habits || [];
        return [...acc, ...habits.map(habit => ({
          ...habit,
          goalName: goal.name,
          goalId: goal._id
        }))];
      }, []);

      // Process weekly data
      const weeklyDisplayData = processWeeklyData(allActualHabits);
      setFetchedWeeklyData(weeklyDisplayData);
      setLoadingWeek(false);

      // Process monthly data
      const monthlyDisplayData = processMonthlyData(allActualHabits);
      setFetchedMonthlyData(monthlyDisplayData);
      setLoadingMonth(false);

      // --- Process Goals for Goal Card --- 
      const goalsWithStats = goalsData.map(goal => {
        const habits = goal.habits || [];
        const totalHabitsInGoal = habits.length;
        const completedHabitsInGoal = habits.filter(h => h && h.completed).length;
        const completionRate = totalHabitsInGoal > 0 ? (completedHabitsInGoal / totalHabitsInGoal) * 100 : 0;
        return {
          ...goal,
          totalHabits: totalHabitsInGoal,
          completedHabits: completedHabitsInGoal,
          completionRate: completionRate
        };
      });
      setFetchedGoalsWithStats(goalsWithStats);
      setLoadingGoals(false);

      // --- Process Today's Habits from flat list --- 
      const today = new Date(); 
      today.setHours(0, 0, 0, 0);
      const todaysHabitsForDisplay = allActualHabits.map(habit => ({
        _id: habit._id,
        name: habit.name,
        completed: habit.completed || false,
        status: habit.completed ? 'completed' : 'pending',
        category: habit.category || 'other',
        goalName: habit.goalName,
        goalId: habit.goalId
      })).sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
      });
      setFetchedTodaysHabits(todaysHabitsForDisplay);
      setLoadingToday(false);

      // --- Calculate Streaks from flat list --- 
      let maxStreak = 0;
      let totalStreaksValue = 0;
      let activeHabitCount = 0;

      allActualHabits.forEach(habit => {
        maxStreak = Math.max(maxStreak, habit.streak || 0);
        if ((habit.streak || 0) > 0) {
          totalStreaksValue += habit.streak;
          activeHabitCount++;
        }
      });

      const avgStreak = activeHabitCount > 0 ? Math.round(totalStreaksValue / activeHabitCount) : 0;
      const currentLongestStreak = allActualHabits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

      setFocusStreaks({
        max: maxStreak,
        avg: avgStreak,
        last: currentLongestStreak,
        streak: currentLongestStreak
      });
      setLoadingStreaks(false);

    } catch (err) {
      console.error("Failed to fetch overview data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      toast.error("Failed to load dashboard data");
      setLoadingToday(false);
      setLoadingWeek(false);
      setLoadingMonth(false);
      setLoadingAll(false);
      setLoadingGoals(false);
      setLoadingStreaks(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200">Dashboard</h1>
          <p className="text-base text-wax-flower-300">Welcome [User Name], here is your</p>
        </div>
        {/* Motivational Quote Tile */}
        <div className="bg-wax-flower-900/80 border border-wax-flower-700/40 rounded-xl shadow-md px-6 py-4 flex flex-col items-end min-w-[260px] max-w-xs ml-4">
          <div className="flex items-center w-full justify-between mb-2">
            <span className="text-sm font-semibold text-wax-flower-300">Stay Motivated</span>
            <button
              onClick={refreshQuote}
              className="ml-2 p-1 rounded-full hover:bg-wax-flower-700/40 transition-colors"
              title="Show another quote"
            >
              <RefreshCw className="h-5 w-5 text-[#FD6A3A]" />
            </button>
          </div>
          <div className="text-wax-flower-200 text-base text-right italic min-h-[40px]">
            "{motivationalQuotes[quoteIndex]}"
          </div>
        </div>
      </div>

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
          <motion.div
            key={i}
            className={cn(feature.className, "bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-4 hover:border-wax-flower-600/50")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            {feature.header}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 