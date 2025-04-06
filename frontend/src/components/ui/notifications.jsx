import * as React from "react"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const notifications = [
  {
    id: 1,
    title: "Daily Meditation Complete",
    description: "You've completed your daily meditation goal!",
    time: "2 minutes ago"
  },
  {
    id: 2,
    title: "New Achievement",
    description: "You've unlocked the 'Early Bird' badge",
    time: "1 hour ago"
  },
  {
    id: 3,
    title: "Garden Update",
    description: "Your virtual garden is flourishing!",
    time: "2 hours ago"
  }
]

export function NotificationsMenu() {
  const [unreadCount, setUnreadCount] = React.useState(3)

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-md p-2 text-wax-flower-300 hover:bg-wax-flower-900/50 hover:text-wax-flower-300 focus:outline-none">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-wax-flower-500 rounded-full ring-2 ring-white dark:ring-wax-flower-950" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 bg-wax-flower-950/80 backdrop-blur-sm border border-wax-flower-800/30 shadow-lg" 
        align="end"
      >
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base text-wax-flower-100">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-wax-flower-400 hover:text-wax-flower-300"
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-wax-flower-800/30" />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              className="p-4 focus:bg-wax-flower-900/50 hover:bg-wax-flower-900/50"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-wax-flower-100">
                  {notification.title}
                </p>
                <p className="text-xs text-wax-flower-400">
                  {notification.description}
                </p>
                <p className="text-xs text-wax-flower-500">
                  {notification.time}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {notifications.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-wax-flower-400">
              No new notifications
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 