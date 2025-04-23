const express = require("express");
const router = express.Router();
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { verifyToken } = require('./auth');

// Helper function to generate random streak
const getRandomStreak = (max = 10) => Math.floor(Math.random() * (max + 1));

// Sample data organized by categories
const sampleData = {
  health: {
    goalName: 'Build a Healthy Lifestyle',
    goalDescription: 'Develop sustainable habits for physical and mental well-being',
    habits: [
      { name: 'Morning Hydration', description: 'Drink 500ml of water with lemon first thing in the morning.', category: 'health' },
      { name: 'Workout Session', description: '45-minute workout alternating cardio and strength.', category: 'health' },
      { name: 'Balanced Meals', description: 'Eat three balanced meals (protein, carbs, veggies).', category: 'health' },
      { name: 'Sleep Schedule', description: 'Maintain consistent sleep: bed by 10:30 PM, wake at 6:30 AM.', category: 'health' }
    ]
  },
  mindfulness: {
    goalName: 'Cultivate Inner Peace',
    goalDescription: 'Develop mindfulness for emotional balance and clarity.',
    habits: [
      { name: 'Morning Meditation', description: '15-minute guided meditation for breath awareness.', category: 'mindfulness' },
      { name: 'Gratitude Journal', description: 'Write 3 things grateful for and 1 positive experience.', category: 'mindfulness' },
      { name: 'Digital Detox', description: '1-hour break from all digital devices.', category: 'mindfulness' }
    ]
  },
  learning: {
    goalName: 'Master New Skills',
    goalDescription: 'Commit to continuous learning and skill development.',
    habits: [
      { name: 'Technical Reading', description: 'Read technical docs or educational content for 30 mins.', category: 'learning' },
      { name: 'Coding Practice', description: 'Solve one programming challenge or work on a project.', category: 'learning' },
      { name: 'Language Study', description: 'Practice target language using apps or flashcards.', category: 'learning' },
      { name: 'Skill Sharing', description: 'Teach someone or write a blog post about learned skills.', category: 'learning' }
    ]
  },
  productivity: {
    goalName: 'Optimize Daily Workflow',
    goalDescription: 'Create efficient systems for maximum productivity.',
    habits: [
      { name: 'Morning Planning', description: 'Plan day using SMART goals (Specific, Measurable...).', category: 'productivity' },
      { name: 'Focus Sessions', description: 'Complete 2-3 Pomodoro sessions (25min work, 5min break).', category: 'productivity' },
      { name: 'Evening Review', description: 'Review achievements, prepare for tomorrow, organize workspace.', category: 'productivity' }
    ]
  },
  self_care: {
    goalName: 'Nurture Self-Care Practices',
    goalDescription: 'Prioritize personal well-being and self-care routines.',
    habits: [
      { name: 'Creative Expression', description: 'Spend 20 mins on creative activity (drawing, writing...).', category: 'self-care' },
      { name: 'Nature Connection', description: 'Tend to plants, take a nature walk, or meditate outdoors.', category: 'self-care' },
      { name: 'Self-Reflection', description: 'Practice self-reflection via journaling or contemplation.', category: 'self-care' }
    ]
  },
  // --- Adding 4 more goals to reach 9 total ---
  finance: {
    goalName: 'Improve Financial Health',
    goalDescription: 'Track spending, save money, and invest wisely.',
    habits: [
      { name: 'Track Expenses', description: 'Record all daily expenses.', category: 'finance' },
      { name: 'Budget Review', description: 'Review budget weekly and adjust.', category: 'finance' },
      { name: 'Save 10%', description: 'Transfer 10% of income to savings.', category: 'finance' }
    ]
  },
  social: {
    goalName: 'Strengthen Social Connections',
    goalDescription: 'Nurture relationships with family and friends.',
    habits: [
      { name: 'Call a Friend', description: 'Call or video chat with a friend.', category: 'social' },
      { name: 'Family Time', description: 'Spend quality time with family members.', category: 'social' },
      { name: 'Community Event', description: 'Attend a local community event or gathering.', category: 'social' }
    ]
  },
  organization: {
    goalName: 'Declutter and Organize',
    goalDescription: 'Maintain a clean and organized living space.',
    habits: [
      { name: '15-Min Tidy', description: 'Spend 15 minutes tidying one area.', category: 'organization' },
      { name: 'Digital Declutter', description: 'Organize digital files or emails for 10 mins.', category: 'organization' },
      { name: 'Weekly Clean', description: 'Perform a quick weekly cleaning routine.', category: 'organization' }
    ]
  },
  hobby: {
    goalName: 'Develop a Hobby',
    goalDescription: 'Dedicate time to pursuing a personal interest or hobby.',
    habits: [
      { name: 'Practice Instrument', description: 'Practice a musical instrument for 20 mins.', category: 'hobby' },
      { name: 'Gardening', description: 'Spend time gardening or caring for plants.', category: 'hobby' },
      { name: 'Crafting', description: 'Work on a crafting project (knitting, painting...).', category: 'hobby' }
    ]
  }
};

// Route to add sample data for the current logged-in user
router.post('/sample-data', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Clear existing goals and habits for this user to avoid duplicates
    await Goal.deleteMany({ userId });
    await Habit.deleteMany({ userId });

    const createdGoals = [];
    const createdHabits = [];

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // Default end date 30 days from today

    // Create goals and habits for each category
    for (const [categoryKey, data] of Object.entries(sampleData)) {
      // Create goal
      const goal = new Goal({
        name: data.goalName,
        description: data.goalDescription,
        userId,
        frequency: 'daily',
        habits: [] // Initialize habits array
      });

      const savedGoal = await goal.save();
      createdGoals.push({
        id: savedGoal._id,
        name: savedGoal.name
      });

      // Create habits for this goal
      for (const habitData of data.habits) {
        const habit = new Habit({
          name: habitData.name,
          description: habitData.description,
          category: habitData.category, // Use category from habitData
          userId,
          goalId: savedGoal._id,
          frequency: 'daily',
          startDate: today, // Add start date
          endDate: endDate, // Add end date
          streak: getRandomStreak(), // Add random streak
          completionHistory: Array(7).fill(false), // Ensure completion history is initialized
          lastCompleted: null // Initialize lastCompleted
        });

        const savedHabit = await habit.save();
        createdHabits.push({
          id: savedHabit._id,
          name: savedHabit.name,
          category: savedHabit.category
        });

        // Add habit ID to goal's habits array
        savedGoal.habits.push(savedHabit._id);
      }

      // Save updated goal with habit references
      await savedGoal.save();
    }

    res.status(201).json({
      message: 'Sample data created successfully',
      goals: createdGoals,
      habits: createdHabits
    });
  } catch (error) {
    console.error('Error creating sample data:', error); // Log the full error
    res.status(500).json({ error: 'Failed to create sample data', details: error.message });
  }
});

module.exports = router; 