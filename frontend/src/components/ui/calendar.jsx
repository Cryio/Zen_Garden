import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export const Calendar = ({
  className,
  mode = "single",
  selected,
  ...props
}) => {
  return (
    <div className={cn("p-3", className)}>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({ length: 31 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-md text-center text-xs flex items-center justify-center",
              selected?.getDate() === i + 1
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
