const express = require("express");
const router = express.Router();
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { verifyToken } = require('./auth');

// Helper function to generate random streak
const getRandomStreak = (max = 14) => Math.floor(Math.random() * (max + 1));

// Helper function to generate random progress
const getRandomProgress = () => Math.floor(Math.random() * (100 + 1));

// Helper function to generate random completion history for past days
const generateCompletionHistory = (days = 30) => {
  const history = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate completion history with increasing probability of completion
  // to simulate habit formation
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Base completion probability increases over time
    const baseProbability = 0.3 + (i / days) * 0.5;
    // Add some randomness
    const completionProbability = baseProbability + (Math.random() * 0.2);
    const completed = Math.random() < completionProbability;
    
    history.push({
      date: date.toISOString().split('T')[0], // Store date in YYYY-MM-DD format
      completed: completed
    });
  }
  
  return history;
};

// Helper function to calculate streak from completion history
const calculateStreak = (history) => {
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  for (const entry of history) {
    if (entry.date === todayStr && entry.completed) {
      currentStreak++;
    } else if (entry.date < todayStr) {
      if (entry.completed) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return currentStreak;
};

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
      { name: 'Language Study', description: 'Practice target language using apps or flashcards.', category: 'learning' }
    ]
  }
};

// Route to add sample data for the current logged-in user
router.post('/sample-data', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Clear existing goals and habits for this user
    await Goal.deleteMany({ userId });
    await Habit.deleteMany({ userId });

    const createdGoals = [];
    const createdHabits = [];

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    // Create goals and habits for each category
    for (const [categoryKey, data] of Object.entries(sampleData)) {
      // Create goal
      const goal = new Goal({
        name: data.goalName,
        description: data.goalDescription,
        userId,
        frequency: 'daily',
        habits: []
      });

      const savedGoal = await goal.save();
      createdGoals.push({
        id: savedGoal._id,
        name: savedGoal.name
      });

      // Create habits for this goal
      for (const habitData of data.habits) {
        const completionHistory = generateCompletionHistory();
        const streak = calculateStreak(completionHistory);
        
        const habit = new Habit({
          name: habitData.name,
          description: habitData.description,
          category: habitData.category,
          userId,
          goalId: savedGoal._id,
          frequency: 'daily',
          startDate: today,
          endDate: endDate,
          streak: streak,
          progress: getRandomProgress(),
          completionHistory: completionHistory,
          lastCompleted: completionHistory[0].completed ? today : null
        });

        const savedHabit = await habit.save();
        createdHabits.push({
          id: savedHabit._id,
          name: savedHabit.name,
          category: savedHabit.category,
          streak: savedHabit.streak,
          progress: savedHabit.progress
        });

        savedGoal.habits.push(savedHabit._id);
      }

      await savedGoal.save();
    }

    res.status(201).json({
      message: 'Sample data created successfully',
      goals: createdGoals,
      habits: createdHabits
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    res.status(500).json({ error: 'Failed to create sample data', details: error.message });
  }
});

module.exports = router; 