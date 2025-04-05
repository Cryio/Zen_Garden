"use client"

import React, { useState } from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

export function DatePicker({ startYear, endYear, value, onChange }) {
  // Set default values if not provided
  startYear = startYear || getYear(new Date()) - 100;
  endYear = endYear || getYear(new Date()) + 100;

  // Use internal state but synchronize with the passed value
  const [internalDate, setInternalDate] = useState(value || new Date());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const handleMonthChange = (month) => {
    const newDate = setMonth(internalDate, months.indexOf(month));
    setInternalDate(newDate);
    onChange && onChange(newDate);
  };

  const handleYearChange = (year) => {
    const newDate = setYear(internalDate, parseInt(year));
    setInternalDate(newDate);
    onChange && onChange(newDate);
  };

  const handleSelect = (selectedDate) => {
    if (selectedDate) {
      setInternalDate(selectedDate);
      onChange && onChange(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[250px] justify-start text-left font-normal text-base text-wax-flower-200"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate ? format(internalDate, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-[rgba(126,34,206,0.5)] backdrop-blur-lg border border-[rgba(126,34,206,0.3)] rounded-lg shadow-lg">
        <div className="flex justify-between p-2">
          <Select onValueChange={handleMonthChange} value={months[getMonth(internalDate)]}>
            <SelectTrigger className="w-[110px] bg-[rgba(126,34,206,0.3)] text-wax-flower-200 border-none h-10 text-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="w-auto p-2 bg-[rgba(126,34,206,0.5)] backdrop-blur-lg border border-[rgba(126,34,206,0.3)] rounded-lg shadow-lg">
              {months.map((month) => (
                <SelectItem key={month} value={month} className="text-wax-flower-200 hover:bg-[rgba(126,34,206,0.4)]">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleYearChange} value={getYear(internalDate).toString()}>
            <SelectTrigger className="w-[110px] bg-[rgba(126,34,206,0.3)] text-wax-flower-200 border-none h-10 text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="w-auto p-2 bg-[rgba(126,34,206,0.5)] backdrop-blur-lg border border-[rgba(126,34,206,0.3)] rounded-lg shadow-lg">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-wax-flower-200 hover:bg-[rgba(126,34,206,0.4)]">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={internalDate}
          onSelect={handleSelect}
          initialFocus
          month={internalDate}
          onMonthChange={setInternalDate}
          className="bg-[rgba(126,34,206,0.2)] text-wax-flower-200 border border-[rgba(126,34,206,0.3)] rounded-lg p-2"
        />
      </PopoverContent>
    </Popover>
  );
}
