import React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditHabitDialog({ open, onOpenChange, habit, onSave }) {
  const [formData, setFormData] = React.useState({
    name: habit?.name || '',
    frequency: habit?.frequency || 'daily'
  });

  React.useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        frequency: habit.frequency
      });
    }
  }, [habit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...habit,
      ...formData
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black border-wax-flower-200/20">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-wax-flower-200">Edit Habit</DialogTitle>
            <DialogDescription className="text-wax-flower-400">
              Update your habit details.
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
              <Label htmlFor="frequency" className="text-wax-flower-200">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger 
                  id="frequency"
                  className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200"
                >
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-black border-wax-flower-200/20">
                  <SelectItem value="daily" className="text-wax-flower-200 hover:bg-wax-flower-500/20">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-wax-flower-200 hover:bg-wax-flower-500/20">Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-wax-flower-200 hover:bg-wax-flower-500/20">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              className="bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 