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
import { Textarea } from "@/components/ui/textarea";

export default function EditGoalDialog({ open, onOpenChange, goal, onSave }) {
  const [formData, setFormData] = React.useState({
    name: goal?.name || '',
    description: goal?.description || ''
  });

  React.useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description
      });
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...goal,
      ...formData
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black border-wax-flower-200/20">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-wax-flower-200">Edit Goal</DialogTitle>
            <DialogDescription className="text-wax-flower-400">
              Update your goal details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-wax-flower-200">Goal Name</Label>
              <Input
                id="name"
                placeholder="Enter goal name"
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
                placeholder="Describe your goal..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200 min-h-[100px]"
              />
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