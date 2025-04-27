import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const HabitCard = ({ habit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group relative">
      <motion.div
        className={cn(
          "w-full px-4 py-3 rounded border border-wax-flower-700/30",
          "bg-wax-flower-900/70 hover:bg-wax-flower-900/90 transition-colors duration-150",
          "hover:border-wax-flower-600/50"
        )}
        initial={false}
        animate={{ 
          borderRadius: isExpanded ? "0.5rem 0.5rem 0 0" : "0.5rem",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Single Row Layout */}
        <div className="flex items-center gap-6">
          {/* Habit Name and Goal */}
          <div className="flex items-center gap-4 min-w-[250px]">
            <span className="text-base font-medium text-wax-flower-200">
              {habit.name}
            </span>
            <span className="text-sm text-wax-flower-400">
              {habit.goal}
            </span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="w-16 h-2 bg-wax-flower-800/50 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-colors duration-300",
                  habit.streak >= 7 ? "bg-green-500" :
                  habit.streak >= 3 ? "bg-yellow-500" :
                  "bg-red-500",
                  "w-full"
                )}
              />
            </div>
            <span className="text-sm font-medium text-wax-flower-200">
              {habit.streak} D
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 flex-1">
            <Progress 
              value={habit.progress} 
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B]"
            />
            <span className="text-sm font-medium text-wax-flower-200 min-w-[3rem]">
              {habit.progress}%
            </span>
          </div>

          {/* Dropdown Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-wax-flower-500/10 rounded transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-wax-flower-200" />
            </motion.div>
          </button>
        </div>
      </motion.div>

      {/* Expanded Analytics Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-wax-flower-950/90 border border-t-0 border-wax-flower-700/30 rounded-b">
              <p className="text-sm text-wax-flower-400">
                Detailed analytics coming soon...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitCard; 