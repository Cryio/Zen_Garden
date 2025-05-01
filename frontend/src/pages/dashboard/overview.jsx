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

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [animateQuote, setAnimateQuote] = useState(false);

  const [todaysHabits, setTodaysHabits] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [streaks, setStreaks] = useState({ max: 0, avg: 0, last: 0, current: 0 });
  
  const completedHabitsToday = todaysHabits.filter(h => h.completed).length;
  const totalHabitsToday = todaysHabits.length;

  // Motivational quotes array
  const motivationalQuotes = [
    "Small steps every day lead to big changes.",
    "Progress, not perfection.",
    "Show up. That's half the battle.",
    "You're closer than you think."
  ];

  const cycleQuote = () => {
    setAnimateQuote(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
      setAnimateQuote(false);
    }, 300);
  };

  const navigateToGoal = (goalId) => {
    navigate(`/dashboard/habits`);
  };

  const handleHabitStatus = async (id, newStatus) => {
    const originalHabits = [...todaysHabits];
    
    try {
      const habit = todaysHabits.find(h => h._id === id);
      if (!habit) {
        throw new Error('Habit not found');
      }

      const updatedHabits = todaysHabits.map(h => {
        if (h._id === id) {
          const isCompleted = newStatus === 'completed';
          return { ...h, completed: isCompleted, status: newStatus };
      }
        return h;
    }).sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
      return 0;
      });
      
      setTodaysHabits(updatedHabits);

      await api.put(`/api/habits/${user._id}/habits/${id}`, { 
        completed: newStatus === 'completed',
        goalId: habit.goalId
      });

      toast.success(`Habit marked as ${newStatus}!`);
      await fetchData();
    } catch (err) {
      console.error("Failed to update habit status:", err);
      setTodaysHabits(originalHabits);
      toast.error(err.message || "Failed to update habit status");
    }
  };

  // Helper to prepare monthly data outside main component logic
  const prepareMonthlyData = (habits) => {
    const monthlyCompletionMap = new Map();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    habits.forEach(habit => {
      if (habit.completionHistory && Array.isArray(habit.completionHistory) && habit.completionHistory.length > 0) {
        habit.completionHistory.forEach(completionDateStr => {
          if (completionDateStr) {
            const completionDate = new Date(completionDateStr);
            completionDate.setHours(0, 0, 0, 0);
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            if (completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear) {
              const dateString = completionDate.toISOString().split('T')[0];
              monthlyCompletionMap.set(dateString, (monthlyCompletionMap.get(dateString) || 0) + 1);
            }
          }
        });
      }
    });

    const monthlyDisplayData = [];
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const firstDayOfMonthWeekday = startOfMonth.getDay(); // 0=Sunday

    // Add empty cells for leading days
    for (let i = 0; i < firstDayOfMonthWeekday; i++) {
      monthlyDisplayData.push({ key: `empty-start-${i}`, type: 'empty' });
    }

    // Add actual day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      date.setHours(0,0,0,0);
      const dateString = date.toISOString().split('T')[0];
      const completedCount = monthlyCompletionMap.get(dateString) || 0;
      monthlyDisplayData.push({
        key: dateString,
        type: 'day',
        date: date,
        dayOfMonth: day,
        completed: completedCount,
        total: habits.length,
        isFuture: date > today,
        isToday: date.getTime() === today.getTime(),
      });
    }
    return monthlyDisplayData;
  };

  const fetchData = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const goalsRes = await api.get(`/api/habits/${user._id}/habits`);
      const goalsData = goalsRes.data || [];

      // Process goals
      const goalsWithStats = goalsData.map(goal => {
        const habits = goal.habits || [];
        const totalHabits = habits.length;
        const completedHabits = habits.filter(h => h && h.completed).length;
        const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
        return {
          ...goal,
          totalHabits,
          completedHabits,
          completionRate
        };
      });
      setGoals(goalsWithStats);

      // Process habits
      const allHabits = goalsData.reduce((acc, goal) => {
        if (goal.habits && Array.isArray(goal.habits)) {
          return acc.concat(goal.habits.map(habit => ({
            ...habit,
            goalName: goal.name,
            goalId: goal._id
          })));
        }
        return acc;
      }, []);

      // Process today's habits
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysHabitsForDisplay = allHabits.map(habit => ({
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
      setTodaysHabits(todaysHabitsForDisplay);

      // Process weekly data
      // Get dates for the last 7 days (including today)
      const last7Days = [];
      const dateMap = new Map(); // Map YYYY-MM-DD -> count
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push(date);
        dateMap.set(date.toISOString().split('T')[0], 0);
      }

      // Count completions for each of the last 7 days
      allHabits.forEach(habit => {
        if (habit.completionHistory && Array.isArray(habit.completionHistory)) {
          habit.completionHistory.forEach(completionDateStr => {
            if (completionDateStr) {
              const completionDate = new Date(completionDateStr);
              completionDate.setHours(0, 0, 0, 0);
              const dateString = completionDate.toISOString().split('T')[0];
              if (dateMap.has(dateString)) {
                dateMap.set(dateString, dateMap.get(dateString) + 1);
              }
            }
          });
        }
      });

      const weeklyDisplayData = [];
      // Build display data using the counts from the map
      last7Days.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        weeklyDisplayData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
          date: date.toISOString(),
          completed: dateMap.get(dateString) || 0,
          total: allHabits.length,
          color: '#FD6A3A'
        });
      });
      setWeeklyData(weeklyDisplayData);

      // Process monthly data using helper
      setMonthlyData(prepareMonthlyData(allHabits));

      // Calculate streaks
      let maxStreak = 0;
      let totalStreaksValue = 0;
      let activeHabitCount = 0;

      allHabits.forEach(habit => {
        maxStreak = Math.max(maxStreak, habit.streak || 0);
        if ((habit.streak || 0) > 0) {
          totalStreaksValue += habit.streak;
          activeHabitCount++;
        }
      });

      const avgStreak = activeHabitCount > 0 ? Math.round(totalStreaksValue / activeHabitCount) : 0;
      const currentStreak = allHabits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

      setStreaks({
        max: maxStreak,
        avg: avgStreak,
        last: currentStreak,
        current: currentStreak
      });

    } catch (err) {
      console.error("Failed to fetch overview data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [user]);

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
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-wax-flower-500" />
                  </div>
                ) : todaysHabits.length > 0 ? (
                  todaysHabits.map((habit) => (
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
          
          <div className="relative h-[200px] px-2 pb-8">
            <div className="absolute inset-0 flex items-end justify-between pt-4">
              {weeklyData.map((day, i) => (
                <div key={i} className="group relative flex flex-col items-center" style={{ width: '10%' }}>
                  <motion.div
                    className="w-full rounded-t-md hover:opacity-80 transition-all cursor-pointer"
                    style={{ 
                      height: `${day.total > 0 ? Math.max((day.completed / day.total) * 140, 6) : 6}px`,
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
      header: (() => {
        const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(label => ({ key: `header-${label}`, type: 'header', label }));
        const calendarItems = [...weekdayLabels, ...monthlyData];

        return (
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between border-b border-wax-flower-700/30 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Monthly Overview</h2>
            </div>
          </div>
          
            <div className="grid grid-cols-7 gap-x-1 gap-y-2 p-1">
              {calendarItems.map((item) => {
                if (item.type === 'header') {
                  return (
                    <div key={item.key} className="text-center text-xs font-bold text-wax-flower-400">{item.label}</div>
                  );
                }

                if (item.type === 'empty') {
                  return <div key={item.key} className="aspect-square" />;
                }

                if (item.type === 'day') {
                  let bgColor = '#4A4A4A'; // Base color for no completion
                  let textColor = '#A1A1AA'; // Default text color
                  if (item.isFuture) {
                    bgColor = '#3A3A3A'; // Darker grey for future
                    textColor = '#6A6A6A';
                  } else if (item.completed > 0 && item.total > 0) {
                    const percentage = (item.completed / item.total) * 100;
                    if (percentage >= 75) bgColor = '#FD6A3A'; // Full color
                    else if (percentage >= 50) bgColor = '#fd825b'; // Lighter
                    else if (percentage >= 25) bgColor = '#fd9f7d'; // Even Lighter
                    else bgColor = '#fdbb9f'; // Lightest orange
                    textColor = '#FFFFFF'; // White text on colored background
                  } else if (item.completed === 0 && !item.isFuture) {
                    textColor = '#B1B1BA';
              }
              
              return (
                <motion.div
                      key={item.key}
                      className={cn(
                        "group relative flex items-center justify-center",
                        item.isToday ? "border-2 border-wax-flower-300" : ""
                      )}
                  style={{ 
                    aspectRatio: '1/1',
                    backgroundColor: bgColor,
                        borderRadius: '50%',
                    transition: 'background-color 0.3s ease',
                        width: '26px',
                        height: '26px',
                    margin: 'auto'
                  }}
                  whileHover={{ scale: 1.2 }}
                >
                      <span className="text-xs font-medium" style={{ color: textColor }}>
                        {item.dayOfMonth}
                      </span>
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-wax-flower-800 text-wax-flower-200 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {item.date.toLocaleDateString()}: {item.completed} of {item.total} habits
                  </div>
                </motion.div>
              );
                }
                return null; // Should not happen
            })}
          </div>
        </div>
        );
      })(),
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
            {loading ? (
               <div className="flex justify-center items-center h-[200px]">
                 <Loader2 className="h-8 w-8 animate-spin text-wax-flower-500" />
               </div>
            ) : goals.length > 0 ? (
            <table className="w-full">
              <thead className="text-left text-wax-flower-300">
                <tr>
                    <th className="py-2 pl-2 w-2/3">Goal</th>
                    <th className="py-2 pr-2 w-1/3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                  {goals.map((goal) => (
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
                          <Progress value={goal.completionRate || 0} className="h-2 w-96 bg-wax-flower-800 [&>div]:bg-gradient-to-r [&>div]:from-[#FD6A3A] [&>div]:to-[#FF8C6B]" />
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
              <Clock className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Focus Streaks</h2>
            </div>
          </div>
          
          <div className="flex flex-col justify-center h-[220px] space-y-6 px-4">
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Max:</div>
              <div className="text-xl font-semibold text-wax-flower-200">{streaks.max} days</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Avg:</div>
              <div className="text-xl font-semibold text-wax-flower-200">{streaks.avg} days</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Last:</div>
              <div className="text-xl font-semibold text-wax-flower-200">{streaks.last} days</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-wax-flower-300">Current:</div>
              <div className="text-xl font-semibold text-wax-flower-200">{streaks.current} days</div>
            </div>
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
              <Plus className="h-5 w-5 text-[#FD6A3A]" />
              <h2 className="text-xl font-bold text-wax-flower-200">Add Sample Data</h2>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-[220px] space-y-4">
            <motion.div
              className="w-24 h-24 rounded-full bg-[#FD6A3A]/10 flex items-center justify-center cursor-pointer hover:bg-[#FD6A3A]/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                try {
                  setLoading(true);
                  await api.post('/api/seed/sample-data');
                  toast.success('Sample habits and goals added!');
                  await fetchData(); // Refresh data
                } catch (err) {
                  console.error("Failed to add sample data:", err);
                  toast.error(err.response?.data?.details || err.message || "Failed to add sample data");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Plus className="h-12 w-12 text-[#FD6A3A]" />
            </motion.div>
            <p className="text-sm text-wax-flower-400 text-center px-2">
               Click the button to populate your dashboard with sample goals and habits.
            </p>
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
          <p className="text-base text-wax-flower-300">Welcome {user?.name || 'User'}, here is your overview</p>
        </div>
        
        {/* Motivational Quote Tile */}
        <motion.div 
          className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-4 hover:border-wax-flower-600/50 w-[400px] h-[80px] relative overflow-hidden group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full flex items-center justify-center overflow-hidden">
            <motion.p 
              key={currentQuoteIndex}
              className="text-base font-bold text-wax-flower-200 text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {motivationalQuotes[currentQuoteIndex]}
            </motion.p>
          </div>
          <button 
            className="absolute right-2 top-2 p-1.5 rounded-full bg-wax-flower-800/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-wax-flower-700/50"
            onClick={cycleQuote}
            title="Next quote"
          >
            <RefreshCw className="h-4 w-4 text-wax-flower-300" />
          </button>
        </motion.div>
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