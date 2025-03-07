import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  Home, 
  BarChart2, 
  Leaf, 
  Calendar, 
  Target, 
  Users, 
  HelpCircle,
  Medal
} from 'lucide-react';
import '../../styles/dashboard.css';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationLinks = [
    { name: "Overview", icon: <Home />, path: "/dashboard" },
    { name: "Garden", icon: <Leaf />, path: "/dashboard/garden" },
    { name: "Habits", icon: <Target />, path: "/dashboard/habits" },
    { name: "Calendar", icon: <Calendar />, path: "/dashboard/calendar" },
    { name: "Analytics", icon: <BarChart2 />, path: "/dashboard/analytics" },
  ];

  const bottomLinks = [
    { name: "Settings", icon: <Settings />, path: "/dashboard/settings" },
    { name: "Help & Support", icon: <HelpCircle />, path: "/dashboard/help" },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between mb-6 px-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Zen Garden</h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Menu />
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="mt-auto pt-6 border-t border-muted-foreground/10">
          {bottomLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Topbar */}
      <header className="topbar">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu />
        </Button>

        <div className="topbar-search">
          <Input
            type="search"
            placeholder="Search habits, achievements, or plants..."
            className="max-w-md"
          />
        </div>

        <div className="topbar-actions">
          <Button variant="ghost" size="icon" className="relative">
            <Bell />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon">
            <LogOut />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
} 