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

const achievements = [
  {
    name: "First Streak",
    body: "Complete a habit for 7 days in a row",
  },
  {
    name: "Garden Master",
    body: "Unlock all garden features",
  },
  {
    name: "Focus King",
    body: "Accumulate 100 hours of focus time",
  },
  {
    name: "Habit Hero",
    body: "Complete 50 habits in a month",
  },
];

const AnimatedBackground = ({ className }) => (
  <div className={cn(
    "absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent",
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
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            85%
          </div>
          <div className="text-sm text-wax-flower-500">+5% from yesterday</div>
        </div>
      ),
      icon: <Flower2 className="h-6 w-6 text-primary" />,
      className: "md:col-span-2",
      background: (
        <Marquee
          pauseOnHover
          className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
        >
          {achievements.map((achievement, idx) => (
            <figure
              key={idx}
              className={cn(
                "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                "border-wax-flower-950/10 bg-wax-flower-950/1 hover:bg-wax-flower-950/5",
                "dark:border-wax-flower-50/10 dark:bg-wax-flower-50/10 dark:hover:bg-wax-flower-50/15",
                "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-col">
                  <figcaption className="text-sm font-medium dark:text-white">
                    {achievement.name}
                  </figcaption>
                </div>
              </div>
              <blockquote className="mt-2 text-xs">{achievement.body}</blockquote>
            </figure>
          ))}
        </Marquee>
      ),
    },
    {
      title: "Active Habits",
      description: "Number of habits you're currently tracking",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            12
          </div>
          <div className="text-sm text-wax-flower-500">7 day streak</div>
        </div>
      ),
      icon: <Target className="h-6 w-6 text-primary" />,
      background: <AnimatedBackground />,
    },
    {
      title: "Weekly Overview",
      description: "Your habit completion for the week",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            92%
          </div>
          <div className="text-sm text-wax-flower-500">+2% from last week</div>
        </div>
      ),
      icon: <Calendar className="h-6 w-6 text-primary" />,
      background: (
        <Calendar
          mode="single"
          selected={new Date()}
          className="absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90"
        />
      ),
    },
    {
      title: "Monthly Analytics",
      description: "Detailed insights and trends",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            78%
          </div>
          <div className="text-sm text-wax-flower-500">Monthly average</div>
        </div>
      ),
      icon: <LineChart className="h-6 w-6 text-primary" />,
      className: "md:col-span-2",
      background: <AnimatedBackground />,
    },
    {
      title: "Achievements",
      description: "Milestones and badges earned",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            8
          </div>
          <div className="text-sm text-wax-flower-500">2 new this month</div>
        </div>
      ),
      icon: <Trophy className="h-6 w-6 text-primary" />,
      background: <AnimatedBackground />,
    },
    {
      title: "Garden Status",
      description: "Your Zen Garden progress",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Level 5
          </div>
          <div className="text-sm text-wax-flower-500">3 new flowers</div>
        </div>
      ),
      icon: <Leaf className="h-6 w-6 text-primary" />,
      background: <AnimatedBackground />,
    },
    {
      title: "Focus Time",
      description: "Time spent on habits today",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            2.5h
          </div>
          <div className="text-sm text-wax-flower-500">Daily average</div>
        </div>
      ),
      icon: <Clock className="h-6 w-6 text-primary" />,
      className: "md:col-span-2",
      background: <AnimatedBackground />,
    },
    {
      title: "Best Streak",
      description: "Longest habit streak",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            30d
          </div>
          <div className="text-sm text-wax-flower-500">Personal best</div>
        </div>
      ),
      icon: <Star className="h-6 w-6 text-primary" />,
      background: <AnimatedBackground />,
    },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-wax-flower-foreground">Welcome back! Here's your progress summary</p>
        </div>
      </div>

      <BentoGrid>
        {features.map((feature, i) => (
          <BentoCard
            key={i}
            {...feature}
          />
        ))}
      </BentoGrid>
    </div>
  );
} 