import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function NewHabitDialog({ open, onOpenChange, onSave, goalId }) {
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  
  // Set default end date to 30 days from today
  const defaultEndDate = new Date();
  defaultEndDate.setDate(today.getDate() + 30);
  const formattedEndDate = format(defaultEndDate, 'yyyy-MM-dd');

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    startDate: today,
    endDate: defaultEndDate,
    category: 'health'
  });

  // Only show the dialog if goalId is provided
  useEffect(() => {
    if (open && !goalId) {
      console.error('No goal ID provided to NewHabitDialog');
      toast.error('Unable to add habit: No goal selected');
      onOpenChange(false);
    }
  }, [open, goalId, onOpenChange]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        startDate: today,
        endDate: defaultEndDate,
        category: 'health'
      });
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalId) {
      console.error('No goal ID provided');
      toast.error('Unable to add habit: No goal selected');
      onOpenChange(false);
      return;
    }
    
    // Validate dates
    const start = formData.startDate;
    const end = formData.endDate;
    
    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    onSave({
      name: formData.name,
      description: formData.description,
      startDate: format(formData.startDate, 'yyyy-MM-dd'),
      endDate: format(formData.endDate, 'yyyy-MM-dd'),
      category: formData.category,
      completed: false,
      streak: 0,
      lastCompleted: null
    });
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      startDate: today,
      endDate: defaultEndDate,
      category: 'health'
    });
    
    onOpenChange(false);
  };

  // Don't render the dialog if no goalId is provided
  if (!goalId && open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-black border-wax-flower-200/20">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-wax-flower-200">Create New Habit</DialogTitle>
            <DialogDescription className="text-wax-flower-400">
              Add a new habit to track your daily progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-wax-flower-200">Habit Name</Label>
              <Input
                id="name"
                placeholder="Enter habit name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-wax-flower-200">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your habit"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-wax-flower-200">Start Date</Label>
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                  className="rounded-md border bg-black/50 border-wax-flower-200/20 text-wax-flower-200"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-2",
                    caption: "flex justify-center pt-1 relative items-center text-sm",
                    caption_label: "text-sm font-medium text-wax-flower-200",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-wax-flower-400 w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm relative p-0 [&:has([aria-selected])]:bg-wax-flower-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-wax-flower-500/50 rounded-md",
                    day_selected: "bg-wax-flower-500 text-white hover:bg-wax-flower-500",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-wax-flower-400 opacity-50",
                    day_disabled: "text-wax-flower-400 opacity-50",
                    day_hidden: "invisible"
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-wax-flower-200">End Date</Label>
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                  className="rounded-md border bg-black/50 border-wax-flower-200/20 text-wax-flower-200"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-2",
                    caption: "flex justify-center pt-1 relative items-center text-sm",
                    caption_label: "text-sm font-medium text-wax-flower-200",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-wax-flower-400 w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm relative p-0 [&:has([aria-selected])]:bg-wax-flower-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-wax-flower-500/50 rounded-md",
                    day_selected: "bg-wax-flower-500 text-white hover:bg-wax-flower-500",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-wax-flower-400 opacity-50",
                    day_disabled: "text-wax-flower-400 opacity-50",
                    day_hidden: "invisible"
                  }}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-wax-flower-200">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200 rounded-md p-2"
                required
              >
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="productivity">Productivity</option>
                <option value="self-care">Self-care</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              className="bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
              disabled={!goalId}
            >
              Create Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 