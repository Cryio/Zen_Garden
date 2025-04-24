import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationsMenu } from "@/components/ui/notifications";
import { Chatbot } from "@/pages/dashboard/Chatbot";
import { 
  Settings, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  LineChart, 
  Flower2, 
  Calendar, 
  ListTodo, 
  HelpCircle,
  Timer
} from 'lucide-react';
import { cn } from "@/lib/utils";
import "@/styles/dashboard.css";
import { useAuth } from '@/context/AuthContext';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationLinks = [
    { name: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, path: "/dashboard" },
    { name: "Garden", icon: <Flower2 className="h-4 w-4" />, path: "/dashboard/garden" },
    { name: "Habits", icon: <ListTodo className="h-4 w-4" />, path: "/dashboard/habits" },
    { name: "Analytics", icon: <LineChart className="h-4 w-4" />, path: "/dashboard/analytics" },
    { name: "Pomodoro", icon: <Timer className="h-4 w-4" />, path: "/dashboard/pomodoro" },
  ];

  const bottomLinks = [
    { name: "Settings", icon: <Settings className="h-4 w-4" />, path: "/dashboard/settings" },
    { name: "Help & Support", icon: <HelpCircle className="h-4 w-4" />, path: "/dashboard/help" },
  ];

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wax-flower-500"></div>
    </div>;
  }

  return (
    <div className="flex content-start min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-black backdrop-blur-sm border-r border-wax-flower-200/30 dark:border-wax-flower-800/30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-wax-flower-200/40 dark:border-wax-flower-800/40">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="rounded-full bg-wax-flower-50 dark:bg-wax-flower-950/50 p-1.5 group-hover:bg-wax-flower-100 dark:group-hover:bg-wax-flower-900 transition-colors duration-200">
                <Flower2 className="h-5 w-5 text-wax-flower-500 dark:text-wax-flower-500 dark:group-hover:text-wax-flower-100 transition-colors duration-200" />
              </div>
              <h1 className="text-xl font-bold text-wax-flower-900 dark:text-wax-flower-50">Zen Garden</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-wax-flower-700 dark:text-wax-flower-300 hover:bg-wax-flower-100 dark:hover:bg-wax-flower-900/50"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-wax-flower-500/10 text-wax-flower-700 dark:text-wax-flower-200 border-l-2 border-wax-flower-500"
                    : "text-wax-flower-600 dark:text-wax-flower-300 hover:bg-wax-flower-500/10 hover:text-wax-flower-700 dark:hover:text-wax-flower-200 border-l-2 border-transparent"
                )}
              >
                <span className={cn(
                  "rounded-md p-1.5",
                  location.pathname === link.path
                    ? "bg-wax-flower-500/20 text-wax-flower-600 dark:text-wax-flower-300"
                    : "text-wax-flower-500/70 dark:text-wax-flower-400/70"
                )}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Links */}
          <div className="border-t border-wax-flower-200/40 dark:border-wax-flower-800/40 p-4">
            <div className="text-xs uppercase font-semibold text-wax-flower-500 dark:text-wax-flower-400 tracking-wider mb-2 px-3">
              Support
            </div>
            {bottomLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
                  location.pathname === link.path
                    ? "bg-wax-flower-500/10 text-wax-flower-700 dark:text-wax-flower-200 border-l-2 border-wax-flower-500"
                    : "text-wax-flower-600 dark:text-wax-flower-300 hover:bg-wax-flower-500/10 hover:text-wax-flower-700 dark:hover:text-wax-flower-200 border-l-2 border-transparent"
                )}
              >
                <span className={cn(
                  "rounded-md p-1.5",
                  location.pathname === link.path
                    ? "bg-wax-flower-500/20 text-wax-flower-600 dark:text-wax-flower-300"
                    : "text-wax-flower-500/70 dark:text-wax-flower-400/70"
                )}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm font-medium text-wax-flower-600 hover:bg-wax-flower-50 hover:text-wax-flower-900 dark:text-wax-flower-400 dark:hover:bg-wax-flower-900/50 dark:hover:text-wax-flower-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 border-b border-wax-flower-200/30 dark:border-wax-flower-800/30 bg-gradient-to-b from-wax-flower-900/30 to-wax-flower-950/30 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-wax-flower-700 dark:text-wax-flower-300 hover:bg-wax-flower-100 dark:hover:bg-wax-flower-900/50"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              <Input
                type="search"
                placeholder="Search habits"
                className="max-w-md border-wax-flower-200/50 dark:border-wax-flower-800/50 bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200 placeholder:text-wax-flower-500/50 dark:placeholder:text-wax-flower-400/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <NotificationsMenu />
              <Avatar className="border-2 border-wax-flower-200/50 dark:border-wax-flower-700/30 hover:border-wax-flower-300 dark:hover:border-wax-flower-600 transition-colors">
                <AvatarImage src="" /> 
                <AvatarFallback className="bg-wax-flower-100 dark:bg-wax-flower-800 text-wax-flower-700 dark:text-wax-flower-200">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-b from-wax-flower-950/10 to-wax-flower-900/30">
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
};

export default DashboardLayout; 