import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function DateSelector({ onDateChange }) {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange(selectedDate);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-[200px] justify-start text-left font-normal bg-wax-flower-900/50 hover:bg-wax-flower-800/50 border-wax-flower-700/30 hover:border-wax-flower-600/50 text-wax-flower-200"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-wax-flower-300" />
          {date ? format(date, "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2 bg-wax-flower-900/80 backdrop-blur-sm border border-wax-flower-700/30 rounded-lg shadow-lg"
        align="end"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className="bg-wax-flower-900/50 text-wax-flower-200 border border-wax-flower-700/30 rounded-lg p-2"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-wax-flower-200",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-wax-flower-200",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-wax-flower-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-wax-flower-200 hover:bg-wax-flower-500/20 rounded-md",
            day_selected: "bg-wax-flower-500 text-white hover:bg-wax-flower-500 hover:text-white focus:bg-wax-flower-500 focus:text-white",
            day_today: "bg-wax-flower-500/20 text-wax-flower-200",
            day_outside: "text-wax-flower-400 opacity-50",
            day_disabled: "text-wax-flower-400 opacity-50",
            day_range_middle: "aria-selected:bg-wax-flower-500/20 aria-selected:text-wax-flower-200",
            day_hidden: "invisible"
          }}
        />
      </PopoverContent>
    </Popover>
  );
} 