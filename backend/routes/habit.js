const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { verifyToken } = require('./auth');

// Get all goals and habits for a user
router.get("/:userId/habits", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const goals = await Goal.find({ userId: req.params.userId })
      .populate('habits')
      .sort({ createdAt: -1 });
    
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

// Create a new goal
router.post("/:userId/habits", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const goal = new Goal({
      ...req.body,
      userId: req.params.userId
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(400).json({ message: 'Error creating goal' });
  }
});

// Create a new habit
router.post("/:userId/habits/:goalId", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify that the goal belongs to the user
    const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.params.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const habit = new Habit({
      ...req.body,
      goalId: req.params.goalId,
      userId: req.params.userId
    });
    await habit.save();

    // Add habit to goal's habits array
    await Goal.findByIdAndUpdate(
      req.params.goalId,
      { $push: { habits: habit._id } }
    );

    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(400).json({ message: 'Error creating habit' });
  }
});

// Update habit completion status
router.put("/:userId/habits/:habitId", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify that the habit belongs to the user
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.params.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const isCompleted = req.body.completed; // Get boolean completion status
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    // Update completion history
    let completionHistory = habit.completionHistory || [];
    const todayStr = today.toISOString().split('T')[0];

    // Filter out any entries for today already existing
    completionHistory = completionHistory.filter(d => d.toISOString().split('T')[0] !== todayStr);

    if (isCompleted) {
      // Add today if marking as completed
      completionHistory.push(today);
      completionHistory.sort((a, b) => a - b); // Keep history sorted
    }

    // --- Recalculate Streak --- 
    let currentStreak = 0;
    if (completionHistory.length > 0) {
        // Check consecutive days ending today or yesterday
        const sortedHistory = completionHistory.map(d => new Date(d).setHours(0,0,0,0)).sort((a, b) => b - a);
        let lastCompletionTime = sortedHistory[0];

        // Only count streak if last completion was today or yesterday
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (lastCompletionTime === today.getTime() || lastCompletionTime === yesterday.getTime()) {
            currentStreak = 1;
            for (let i = 1; i < sortedHistory.length; i++) {
                const currentDay = new Date(lastCompletionTime);
                const previousDay = new Date(currentDay); previousDay.setDate(currentDay.getDate() - 1);
                
                if (sortedHistory[i] === previousDay.getTime()) {
                    currentStreak++;
                    lastCompletionTime = sortedHistory[i];
                } else {
                    break; // Non-consecutive day found
                }
            }
        }
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.habitId,
      { 
        completed: isCompleted,
        lastCompleted: isCompleted ? new Date() : habit.lastCompleted, // Update date only if completed
        completionHistory: completionHistory,
        streak: currentStreak
      },
      { new: true } // Return the updated document
    );

    res.json(updatedHabit); // Return the updated habit object

  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(400).json({ message: 'Error updating habit' });
  }
});

// Update goal
router.put("/:userId/habits/:goalId", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify that the goal belongs to the user
    const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.params.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.goalId,
      req.body,
      { new: true }
    );
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(400).json({ message: 'Error updating goal' });
  }
});

// Delete goal
router.delete("/:userId/habits/:goalId", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify that the goal belongs to the user
    const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.params.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Delete all habits associated with the goal
    await Habit.deleteMany({ goalId: req.params.goalId });
    
    // Delete the goal
    await Goal.findByIdAndDelete(req.params.goalId);
    
    res.json({ message: 'Goal and associated habits deleted' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(400).json({ message: 'Error deleting goal' });
  }
});

// Delete habit
router.delete("/:userId/habits/:goalId/:habitId", verifyToken, async (req, res) => {
  try {
    // Verify that the requested userId matches the authenticated user
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify that the goal belongs to the user
    const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.params.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Verify that the habit belongs to the user and goal
    const habit = await Habit.findOne({ 
      _id: req.params.habitId, 
      userId: req.params.userId,
      goalId: req.params.goalId 
    });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Remove habit from goal's habits array
    await Goal.findByIdAndUpdate(
      req.params.goalId,
      { $pull: { habits: req.params.habitId } }
    );
    
    // Delete the habit
    await Habit.findByIdAndDelete(req.params.habitId);
    
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(400).json({ message: 'Error deleting habit' });
  }
});

module.exports = router;
