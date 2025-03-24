import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { 
  Flower2, 
  Target, 
  Calendar, 
  LineChart, 
  Trophy, 
  Leaf, 
  Clock, 
  Star 
} from 'lucide-react';
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const AnimatedBackground = ({ className }) => (
  <div className={cn(
    "absolute inset-0 -z-10 bg-gradient-to-br from-wax-flower-500/20 via-transparent to-transparent",
    "opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300",
    className
  )} />
);

export default function Overview() {
  const features = [
    {
      title: "Daily Progress",
      description: "Track your daily habit completion rate",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-100 to-wax-flower-300">
            85%
          </div>
          <div className="text-sm text-wax-flower-400">+5% from yesterday</div>
        </div>
      ),
      icon: <Flower2 className="h-6 w-6 text-wax-flower-400" />,
      className: "md:col-span-2",
      background: (
        <Marquee
          pauseOnHover
          className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
        >
        </Marquee>
      ),
    },
    {
      title: "Active Habits",
      description: "Number of habits you're currently tracking",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-100 to-wax-flower-300">
            12
          </div>
          <div className="text-sm text-wax-flower-400">7 day streak</div>
        </div>
      ),
      icon: <Target className="h-6 w-6 text-wax-flower-400" />,
      background: <AnimatedBackground />,
    },
    {
      title: "Weekly Overview",
      description: "Your habit completion for the week",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-100 to-wax-flower-300">
            92%
          </div>
          <div className="text-sm text-wax-flower-400">+2% from last week</div>
        </div>
      ),
    },
    {
      title: "Monthly Analytics",
      description: "Detailed insights and trends",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-100 to-wax-flower-300">
            78%
          </div>
          <div className="text-sm text-wax-flower-400">Monthly average</div>
        </div>
      ),
      icon: <LineChart className="h-6 w-6 text-wax-flower-400" />,
      className: "md:col-span-2",
      background: <AnimatedBackground />,
    },
    {
      title: "Focus Time",
      description: "Time spent on habits today",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-100 to-wax-flower-300">
            2.5h
          </div>
          <div className="text-sm text-wax-flower-400">Daily average</div>
        </div>
      ),
      icon: <Clock className="h-6 w-6 text-wax-flower-400" />,
      className: "md:col-span-2",
      background: <AnimatedBackground />,
    },
    {
      title: "Best Streak",
      description: "Longest habit streak",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-100 to-wax-flower-300">
            21d
          </div>
          <div className="text-sm text-wax-flower-400">Personal best</div>
        </div>
      ),
      icon: <Star className="h-6 w-6 text-wax-flower-400" />,
      background: <AnimatedBackground />,
    },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200 dark:text-wax-flower-100">Dashboard Overview</h1>
          <p className="text-wax-flower-400 dark:text-wax-flower-300">Welcome back! Here's your progress summary</p>
        </div>
      </div>

      <BentoGrid>
        {features.map((feature, i) => (
          <BentoCard
            key={i}
            {...feature}
            className={cn(feature.className, "bg-wax-flower-900/70 dark:bg-wax-flower-900/70 border-wax-flower-700/30 dark:border-wax-flower-700/30 hover:border-wax-flower-600/50 dark:hover:border-wax-flower-600/50")}
          />
        ))}
      </BentoGrid>
    </div>
  );
} 