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
import { Loader2 } from "lucide-react";

function NewGoalDialog({ open, onOpenChange, onSubmit }) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Goal name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        habits: [],
        completed: false,
        progress: 0
      });

      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setError('');
      setIsSubmitting(false);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-black border-wax-flower-200/20">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-wax-flower-200">Create New Goal</DialogTitle>
            <DialogDescription className="text-wax-flower-400">
              Add a new goal to track your progress and habits.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-wax-flower-200">Goal Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter goal name"
                className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200"
                required
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-wax-flower-200">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal..."
                className="bg-black/50 border-wax-flower-200/20 text-wax-flower-200 min-h-[100px]"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              className="bg-wax-flower-500 hover:bg-wax-flower-600 text-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Goal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewGoalDialog; 