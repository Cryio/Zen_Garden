import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check, Clock, X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const mockNotifications = [
  {
    id: 1,
    title: "Habit Streak Achieved!",
    message: "You've maintained your meditation habit for 7 days!",
    time: "2 hours ago",
    type: "success",
  },
  {
    id: 2,
    title: "Garden Update",
    message: "New flower has bloomed in your garden",
    time: "5 hours ago",
    type: "info",
  },
  {
    id: 3,
    title: "Reminder",
    message: "Time to water your virtual plants",
    time: "1 day ago",
    type: "reminder",
  },
];

export function NotificationsPopover() {
  const [notifications, setNotifications] = React.useState(mockNotifications);
  const [hasUnread, setHasUnread] = React.useState(true);

  const clearNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-wax-flower-500" />;
      default:
        return <Bell className="h-4 w-4 text-wax-flower-400" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-wax-flower-300 hover:bg-wax-flower-900/50 hover:text-wax-flower-300"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-wax-flower-500 rounded-full ring-2 ring-white dark:ring-wax-flower-950" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white dark:bg-wax-flower-950 border border-wax-flower-200/30 dark:border-wax-flower-800/30 shadow-lg" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-wax-flower-200/20 dark:border-wax-flower-800/20">
          <h4 className="text-sm font-semibold text-wax-flower-200 dark:text-wax-flower-100">Notifications</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setHasUnread(false)}
            className="text-xs text-wax-flower-400 hover:text-wax-flower-300"
          >
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-wax-flower-200/20 dark:divide-wax-flower-800/20">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-4 p-4 hover:bg-wax-flower-100/5 dark:hover:bg-wax-flower-900/20 transition-colors"
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-wax-flower-200 dark:text-wax-flower-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-wax-flower-400 dark:text-wax-flower-300">
                      {notification.message}
                    </p>
                    <p className="text-xs text-wax-flower-500 dark:text-wax-flower-400">
                      {notification.time}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-wax-flower-400 hover:text-wax-flower-300"
                    onClick={() => clearNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Bell className="h-8 w-8 text-wax-flower-400 mb-2" />
              <p className="text-sm text-wax-flower-300 text-center">
                No new notifications
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 