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
  Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

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

// Update weekly data structure
const weeklyData = [
  { day: "M", completed: 8, total: 12, color: "#FD6A3A" },
  { day: "T", completed: 10, total: 12, color: "#FD6A3A" },
  { day: "W", completed: 7, total: 12, color: "#FD6A3A" },
  { day: "T", completed: 11, total: 12, color: "#FD6A3A" },
  { day: "F", completed: 9, total: 12, color: "#FD6A3A" },
  { day: "S", completed: 12, total: 12, color: "#FD6A3A" },
  { day: "S", completed: 6, total: 12, color: "#FD6A3A" }
];

// Update monthly data structure for better visualization
const monthlyData = Array(35).fill(null).map((_, i) => ({
  date: new Date(Date.now() - (34 - i) * 24 * 60 * 60 * 1000),
  completed: Math.floor(Math.random() * 12),
  total: 12,
  isFuture: i > 28,
  color: i > 28 ? "#817A87" : "#FD6A3A"
}));

const allHabits = [
  { id: 1, name: "Eat", progress: 74, streak: 8, category: "health" },
  { id: 2, name: "Sleep", progress: 51, streak: 7, category: "health" },
  { id: 3, name: "Geography", progress: 30, streak: 1, category: "learning" },
  { id: 4, name: "Maths", progress: 89, streak: 13, category: "learning" },
  { id: 5, name: "Gym", progress: 44, streak: 8, category: "health" },
  // Add more habits here
];

export default function Overview() {
  const { user } = useAuth();
  const [habits, setHabits] = useState(todaysHabits);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitFilter, setHabitFilter] = useState('newest');
  const [loadingAll, setLoadingAll] = useState(true);
  const [fetchedTodaysHabits, setFetchedTodaysHabits] = useState([]);
  const [fetchedWeeklyData, setFetchedWeeklyData] = useState([]);
  const [fetchedMonthlyData, setFetchedMonthlyData] = useState([]);
  const [fetchedAllHabits, setFetchedAllHabits] = useState([]);
  const [focusStreaks, setFocusStreaks] = useState({ max: 'N/A', avg: 'N/A', last: 'N/A', streak: 0 });
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(true);
  const [error, setError] = useState(null);
  
  const completedHabits = habits.filter(h => h.status === 'completed').length;
  const totalHabits = habits.length;

  const handleHabitStatus = async (id, status) => {
    const originalHabits = [...fetchedTodaysHabits];
    
    try {
      // Find the habit in our fetched habits
      const habit = fetchedAllHabits.find(h => h._id === id);
      if (!habit) {
        console.error(`Habit with ID ${id} not found in fetchedAllHabits:`, fetchedAllHabits);
        throw new Error('Habit not found in local state');
      }

      // Optimistically update UI
      const updatedHabits = fetchedTodaysHabits.map(h => {
        if (h.id === id) {
          return { ...h, status };
        }
        return h;
      }).sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return 0;
      });
      
      setFetchedTodaysHabits(updatedHabits);

      // Make API call
      console.log('Updating habit status:', {
        habitId: id,
        userId: user._id,
        status,
        goalId: habit.goalId
      });

      const response = await api.put(`/api/habits/${user._id}/habits/${id}`, { 
        completed: status === 'completed',
        goalId: habit.goalId
      });

      console.log('Habit status update response:', response);
      
      toast.success(`Habit marked as ${status}!`, {
        style: {
          background: '#363636',
          color: '#fff',
        },
        duration: 3000,
      });
      
      // Refresh data to ensure everything is in sync
      await fetchData();
    } catch (err) {
      console.error("Failed to update habit status:", err);
      console.error("Error details:", err.response?.data || err.message);
      
      // Revert to original state
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
                    className="flex items-center justify-between border-b border-wax-flower-700/30 py-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        habit.category === 'health' ? 'bg-green-500' :
                        habit.category === 'learning' ? 'bg-blue-500' :
                        habit.category === 'mindfulness' ? 'bg-purple-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="text-base font-medium text-wax-flower-200 group-hover:text-[#FD6A3A] transition-colors">
                        {habit.name}
                      </div>
                    </div>
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
                      scale: [(completedHabits / totalHabits) * 0.8, (completedHabits / totalHabits) * 0.9, (completedHabits / totalHabits) * 0.8],
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
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.02, 1],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <span className="text-2xl font-bold text-wax-flower-200">
                    {Math.round((completedHabits / totalHabits) * 100)}%
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
              {weeklyData.map((day, i) => (
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
            {monthlyData.map((day, i) => {
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
                  <tr key={habit.id} className="border-b border-wax-flower-700/30 group">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          habit.category === 'health' ? 'bg-green-500' :
                          habit.category === 'learning' ? 'bg-blue-500' :
                          habit.category === 'mindfulness' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`} />
                        <div className="text-base font-medium text-wax-flower-200 group-hover:text-[#FD6A3A] transition-colors">
                          {habit.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={habit.progress} className="h-2" />
                        <span className="text-wax-flower-300">{habit.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 text-wax-flower-300">
                        <Sparkles className="h-4 w-4 text-[#FD6A3A]" />
                        {habit.streak} day streak
                      </div>
                    </td>
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
      setFocusStreaks({ max: 'N/A', avg: 'N/A', last: 'N/A', streak: 0 });
      setLoadingToday(true);
      setLoadingWeek(true);
      setLoadingMonth(true);
      setLoadingAll(true);
      setLoadingStreaks(true);
      setError(null);
      return;
    }

    fetchData();
  }, [user, habitFilter]);

  const fetchData = async () => {
    setError(null);
    try {
      // Fetch all habits
      setLoadingAll(true);
      const allRes = await api.get(`/api/habits/${user._id}/habits?filter=${habitFilter}`);
      let allHabits = allRes.data || [];
      
      // Ensure each habit has a completionHistory array
      allHabits = allHabits.map(habit => {
        if (!habit.completionHistory) {
          console.log(`Habit "${habit.name}" is missing completionHistory, adding empty array`);
          return {
            ...habit,
            completionHistory: Array(7).fill(false)
          };
        }
        return habit;
      });
      
      setFetchedAllHabits(allHabits);
      setLoadingAll(false);

      // Process today's habits
      setLoadingToday(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysHabits = allHabits.map(habit => ({
        id: habit._id,
        _id: habit._id,
        name: habit.name,
        status: habit.completed ? 'completed' : 
               (habit.lastCompleted && new Date(habit.lastCompleted) >= today) ? 'completed' : 'pending',
        category: habit.category || 'other',
        goalName: habit.goalId?.name
      }));
      setFetchedTodaysHabits(todaysHabits);
      setLoadingToday(false);

      // Process weekly data
      setLoadingWeek(true);
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayData = {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString(),
          completed: 0,
          total: allHabits.length,
          color: '#FD6A3A'
        };
        allHabits.forEach(habit => {
          if (habit.completionHistory && habit.completionHistory[i]) {
            dayData.completed++;
          }
        });
        weeklyData.push(dayData);
      }
      setFetchedWeeklyData(weeklyData);
      setLoadingWeek(false);

      // Process monthly data
      setLoadingMonth(true);
      const monthlyData = [];
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        const dayData = {
          date: new Date(date).toISOString(),
          completed: 0,
          total: allHabits.length,
          isFuture: date > today
        };

        if (!dayData.isFuture) {
          allHabits.forEach(habit => {
            const dayIndex = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            if (dayIndex < 7 && habit.completionHistory && habit.completionHistory[dayIndex]) {
              dayData.completed++;
            }
          });
        }
        monthlyData.push(dayData);
      }
      setFetchedMonthlyData(monthlyData);
      setLoadingMonth(false);

      // Calculate streaks
      setLoadingStreaks(true);
      let maxStreak = 0;
      let totalStreaks = 0;
      let streakCount = 0;

      allHabits.forEach(habit => {
        maxStreak = Math.max(maxStreak, habit.streak || 0);
        if (habit.streak > 0) {
          totalStreaks += habit.streak;
          streakCount++;
        }
      });

      const avgStreak = streakCount > 0 ? Math.round(totalStreaks / streakCount) : 0;
      const currentStreak = allHabits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

      setFocusStreaks({
        max: maxStreak,
        avg: avgStreak,
        last: currentStreak,
        streak: currentStreak
      });
      setLoadingStreaks(false);

    } catch (err) {
      console.error("Failed to fetch overview data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      toast.error("Failed to load dashboard data", {
        style: {
          background: '#363636',
          color: '#fff',
        },
        duration: 5000,
      });
      setLoadingToday(false);
      setLoadingWeek(false);
      setLoadingMonth(false);
      setLoadingAll(false);
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