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
  LayoutDashboard, 
  LineChart, 
  Flower2, 
  Calendar, 
  ListTodo, 
  HelpCircle
} from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationLinks = [
    { name: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, path: "/dashboard" },
    { name: "Garden", icon: <Flower2 className="h-4 w-4" />, path: "/dashboard/garden" },
    { name: "Habits", icon: <ListTodo className="h-4 w-4" />, path: "/dashboard/habits" },
    { name: "Calendar", icon: <Calendar className="h-4 w-4" />, path: "/dashboard/calendar" },
    { name: "Analytics", icon: <LineChart className="h-4 w-4" />, path: "/dashboard/analytics" },
  ];

  const bottomLinks = [
    { name: "Settings", icon: <Settings className="h-4 w-4" />, path: "/dashboard/settings" },
    { name: "Help & Support", icon: <HelpCircle className="h-4 w-4" />, path: "/dashboard/help" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Zen Garden</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Links */}
          <div className="border-t p-4">
            {bottomLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 border-b bg-card">
          <div className="flex h-16 items-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search habits, achievements, or plants..."
                className="max-w-md"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 