const express = require("express");
const router = express.Router();
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { verifyToken } = require('./auth');

// const getRandomStreak = (max = 10) => Math.floor(Math.random() * (max + 1)); // Replaced by history-based calculation

// Helper function to generate random completion history for the last ~60 days
const generateRandomHistory = (daysBack = 60, completionRate = 0.6) => {
  const history = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate start date (2 months ago)
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 2);
  startDate.setDate(1); // Start from the first day of the month

  // Generate dates for the last 2 months
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    if (Math.random() < completionRate) { // Simulate completion rate
      const date = new Date(currentDate);
      date.setHours(0, 0, 0, 0); // Ensure time is normalized
      history.push(date);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return history.sort((a, b) => a - b); // Return sorted dates
};

// Helper function to calculate streak based on history
const calculateStreakFromHistory = (history) => {
  if (!history || history.length === 0) return 0;

  const sortedHistory = history.map(d => new Date(d).setHours(0,0,0,0)).sort((a, b) => b - a);
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  let lastCompletionTime = sortedHistory[0];

  // Only count streak if last completion was today or yesterday
  if (lastCompletionTime === today.getTime() || lastCompletionTime === yesterday.getTime()) {
      streak = 1;
      for (let i = 1; i < sortedHistory.length; i++) {
          const currentDay = new Date(lastCompletionTime);
          const previousDay = new Date(currentDay); previousDay.setDate(currentDay.getDate() - 1);

          if (sortedHistory[i] === previousDay.getTime()) {
              streak++;
              lastCompletionTime = sortedHistory[i];
          } else {
              break; // Non-consecutive day found
          }
      }
  }
  return streak;
};

// Sample data organized by categories
const sampleData = {
  health: {
    goalName: 'Build a Healthy Lifestyle',
    goalDescription: 'Develop sustainable habits for physical and mental well-being',
    habits: [
      // Target: 10-15
      { name: 'Morning Hydration', description: 'Drink 500ml of water with lemon first thing in the morning.', category: 'health' },
      { name: 'Workout Session', description: '45-minute workout alternating cardio and strength.', category: 'health' },
      { name: 'Balanced Meals', description: 'Eat three balanced meals (protein, carbs, veggies).', category: 'health' },
      { name: 'Sleep Schedule', description: 'Maintain consistent sleep: bed by 10:30 PM, wake at 6:30 AM.', category: 'health' },
      { name: 'Take Vitamins', description: 'Take daily multivitamin and Vitamin D.', category: 'health' },
      { name: 'Stretch Break', description: '5-minute stretching break every hour of sitting.', category: 'health' },
      { name: 'Evening Wind-Down Routine', description: '30 minutes of screen-free relaxation before bed.', category: 'health' },
      { name: 'Mindful Eating Practice', description: 'Eat one meal per day without distractions.', category: 'health' },
      { name: 'Check Posture Regularly', description: 'Set reminders to check and correct posture.', category: 'health' },
      { name: 'Walk 10,000 Steps', description: 'Aim for 10,000 steps daily using a tracker.', category: 'health' },
      { name: 'Limit Sugary Drinks', description: 'Replace sugary drinks with water or herbal tea.', category: 'health' },
      { name: 'Healthy Snack Choice', description: 'Choose fruit or nuts instead of processed snacks.', category: 'health' }
    ]
  },
  mindfulness: {
    goalName: 'Cultivate Inner Peace',
    goalDescription: 'Develop mindfulness for emotional balance and clarity.',
    habits: [
      // Target: 10-15
      { name: 'Morning Meditation', description: '15-minute guided meditation for breath awareness.', category: 'mindfulness' },
      { name: 'Gratitude Journal', description: 'Write 3 things grateful for and 1 positive experience.', category: 'mindfulness' },
      { name: 'Digital Detox', description: '1-hour break from all digital devices.', category: 'mindfulness' },
      { name: 'Mindful Breathing', description: 'Practice 5 minutes of mindful breathing during the day.', category: 'mindfulness' },
      { name: 'Body Scan', description: 'Perform a 10-minute body scan meditation before sleep.', category: 'mindfulness' },
      { name: 'Mindful Walking', description: 'Pay attention to senses during a short walk.', category: 'mindfulness' },
      { name: 'Observe Thoughts Non-Judgmentally', description: 'Practice observing thoughts without attachment.', category: 'mindfulness' },
      { name: 'Listen Fully in Conversation', description: 'Practice active listening without interrupting.', category: 'mindfulness' },
      { name: 'Mindful Task Completion', description: 'Focus fully on one chore or task.', category: 'mindfulness' },
      { name: 'Nature Observation', description: 'Spend 5 minutes observing a natural element.', category: 'mindfulness' },
      { name: 'Progressive Muscle Relaxation', description: 'Tense and release muscle groups for 10 minutes.', category: 'mindfulness' }
    ]
  },
  learning: {
    goalName: 'Master New Skills',
    goalDescription: 'Commit to continuous learning and skill development.',
    habits: [
      // Target: 10-15
      { name: 'Technical Reading', description: 'Read technical docs or educational content for 30 mins.', category: 'learning' },
      { name: 'Coding Practice', description: 'Solve one programming challenge or work on a project.', category: 'learning' },
      { name: 'Language Study', description: 'Practice target language using apps or flashcards.', category: 'learning' },
      { name: 'Skill Sharing', description: 'Teach someone or write a blog post about learned skills.', category: 'learning' },
      { name: 'Online Course Module', description: 'Complete one module of an online course.', category: 'learning' },
      { name: 'Watch Educational Video', description: 'Watch one educational video related to skills.', category: 'learning' },
      { name: 'Summarize Learned Concepts', description: 'Write a short summary of something new learned.', category: 'learning' },
      { name: 'Practice with Flashcards', description: 'Review flashcards for memorization.', category: 'learning' },
      { name: 'Explore New Tool/Software', description: 'Spend 15 mins exploring a new tool.', category: 'learning' },
      { name: 'Attend Webinar/Workshop', description: 'Participate in an online learning event.', category: 'learning' },
      { name: 'Apply New Skill in Project', description: 'Integrate a newly learned skill into a personal project.', category: 'learning' },
      { name: 'Read Industry News', description: 'Stay updated with news in the relevant field.', category: 'learning' }
    ]
  },
  productivity: {
    goalName: 'Optimize Daily Workflow',
    goalDescription: 'Create efficient systems for maximum productivity.',
    habits: [
      // Target: 10-15
      { name: 'Morning Planning', description: 'Plan day using SMART goals (Specific, Measurable...).', category: 'productivity' },
      { name: 'Focus Sessions', description: 'Complete 2-3 Pomodoro sessions (25min work, 5min break).', category: 'productivity' },
      { name: 'Evening Review', description: 'Review achievements, prepare for tomorrow, organize workspace.', category: 'productivity' },
      { name: 'Prioritize Tasks (Eisenhower)', description: 'Categorize tasks using the Eisenhower Matrix.', category: 'productivity' },
      { name: 'Inbox Zero', description: 'Process email inbox down to zero.', category: 'productivity' },
      { name: 'Time Blocking', description: 'Allocate specific blocks of time for tasks.', category: 'productivity' },
      { name: 'Batch Similar Tasks', description: 'Group similar small tasks together.', category: 'productivity' },
      { name: 'Single-Tasking Focus', description: 'Avoid multitasking during focused work blocks.', category: 'productivity' },
      { name: 'Prepare for Tomorrow Tonight', description: 'Lay out clothes, pack bag, etc.', category: 'productivity' },
      { name: 'Identify Top 3 Priorities', description: 'Determine the 3 most important tasks for the day.', category: 'productivity' },
      { name: 'Use Task Management Tool', description: 'Update and review tasks in a chosen tool.', category: 'productivity' }
    ]
  },
  self_care: {
    goalName: 'Nurture Self-Care Practices',
    goalDescription: 'Prioritize personal well-being and self-care routines.',
    habits: [
      // Target: 10-15
      { name: 'Creative Expression', description: 'Spend 20 mins on creative activity (drawing, writing...).', category: 'self-care' },
      { name: 'Nature Connection', description: 'Tend to plants, take a nature walk, or meditate outdoors.', category: 'self-care' },
      { name: 'Self-Reflection', description: 'Practice self-reflection via journaling or contemplation.', category: 'self-care' },
      { name: 'Relaxing Bath/Shower', description: 'Take a relaxing bath or shower with intention.', category: 'self-care' },
      { name: 'Read for Pleasure', description: 'Read a book or article purely for enjoyment.', category: 'self-care' },
      { name: 'Listen to Calming Music', description: 'Dedicate time to listening to relaxing music.', category: 'self-care' },
      { name: 'Unplug Before Bed', description: 'Avoid screens for 30-60 minutes before sleep.', category: 'self-care' },
      { name: 'Schedule Downtime', description: 'Block out time in the calendar for rest.', category: 'self-care' },
      { name: 'Hydrate Skin', description: 'Apply moisturizer or lotion.', category: 'self-care' },
      { name: 'Practice Saying No', description: 'Decline requests that overextend energy.', category: 'self-care' },
      { name: 'Comfortable Clothing', description: 'Wear comfortable clothes when relaxing at home.', category: 'self-care' }
    ]
  },
  // --- Adding 4 more goals to reach 9 total ---
  finance: {
    goalName: 'Improve Financial Health',
    goalDescription: 'Track spending, save money, and invest wisely.',
    habits: [
      // Target: 10-15
      { name: 'Track Expenses', description: 'Record all daily expenses.', category: 'finance' },
      { name: 'Budget Review', description: 'Review budget weekly and adjust.', category: 'finance' },
      { name: 'Save 10%', description: 'Transfer 10% of income to savings.', category: 'finance' },
      { name: 'Financial Reading', description: 'Read one article or chapter about personal finance.', category: 'finance' },
      { name: 'Check Credit Score', description: 'Check credit score and report monthly.', category: 'finance' },
      { name: 'Review Subscriptions', description: 'Evaluate and cancel unused subscriptions.', category: 'finance' },
      { name: 'Plan Major Purchases', description: 'Research and plan before making large purchases.', category: 'finance' },
      { name: 'Automate Savings/Investments', description: 'Set up automatic transfers.', category: 'finance' },
      { name: 'Compare Prices', description: 'Compare prices before buying non-essential items.', category: 'finance' },
      { name: 'Set Financial Goal', description: 'Define a specific, measurable financial goal.', category: 'finance' },
      { name: 'Pack Lunch for Work', description: 'Prepare and bring lunch instead of buying.', category: 'finance' }
    ]
  },
  social: {
    goalName: 'Strengthen Social Connections',
    goalDescription: 'Nurture relationships with family and friends.',
    habits: [
      // Target: 10-15
      { name: 'Call a Friend', description: 'Call or video chat with a friend.', category: 'social' },
      { name: 'Family Time', description: 'Spend quality time with family members.', category: 'social' },
      { name: 'Community Event', description: 'Attend a local community event or gathering.', category: 'social' },
      { name: 'Send a Thoughtful Message', description: 'Send a text or email checking in on someone.', category: 'social' },
      { name: 'Plan a Future Outing', description: 'Reach out to plan a future social activity.', category: 'social' },
      { name: 'Engage in Group Hobby', description: 'Participate in a hobby with others.', category: 'social' },
      { name: 'Remember Birthdays/Anniversaries', description: 'Acknowledge important dates for loved ones.', category: 'social' },
      { name: 'Offer Help/Support', description: 'Offer assistance to a friend or neighbor.', category: 'social' },
      { name: 'Share Appreciation', description: 'Express gratitude towards someone.', category: 'social' },
      { name: 'Initiate Conversation', description: 'Start a conversation with someone new or familiar.', category: 'social' },
      { name: 'Attend Social Gathering', description: 'Go to a party, meetup, or social event.', category: 'social' }
    ]
  },
  organization: {
    goalName: 'Declutter and Organize',
    goalDescription: 'Maintain a clean and organized living space.',
    habits: [
      // Target: 10-15
      { name: '15-Min Tidy', description: 'Spend 15 minutes tidying one area.', category: 'organization' },
      { name: 'Digital Declutter', description: 'Organize digital files or emails for 10 mins.', category: 'organization' },
      { name: 'Weekly Clean', description: 'Perform a quick weekly cleaning routine.', category: 'organization' },
      { name: 'Meal Prep Planning', description: 'Plan meals for the next few days.', category: 'organization' },
      { name: 'Sort Mail/Paperwork', description: 'Process and sort incoming mail or paperwork.', category: 'organization' },
      { name: 'Put Things Away Immediately', description: 'Return items to their place after use.', category: 'organization' },
      { name: 'Make the Bed', description: 'Make the bed every morning.', category: 'organization' },
      { name: 'Clean One Small Area', description: 'Clean a drawer, shelf, or countertop.', category: 'organization' },
      { name: 'Review Calendar/Planner', description: 'Check schedule and update planner daily.', category: 'organization' },
      { name: 'Organize Workspace', description: 'Tidy up desk and workspace at end of day.', category: 'organization' },
      { name: 'Donate/Discard Unused Items', description: 'Regularly declutter belongings.', category: 'organization' }
    ]
  },
  hobby: {
    goalName: 'Develop a Hobby',
    goalDescription: 'Dedicate time to pursuing a personal interest or hobby.',
    habits: [
      // Target: 10-15
      { name: 'Practice Instrument', description: 'Practice a musical instrument for 20 mins.', category: 'hobby' },
      { name: 'Gardening', description: 'Spend time gardening or caring for plants.', category: 'hobby' },
      { name: 'Crafting', description: 'Work on a crafting project (knitting, painting...).', category: 'hobby' },
      { name: 'Photography Practice', description: 'Take and edit photos for 30 minutes.', category: 'hobby' },
      { name: 'Baking/Cooking New Recipe', description: 'Try a new recipe related to baking or cooking hobby.', category: 'hobby' },
      { name: 'Learn New Song/Piece', description: 'Learn a section of a new musical piece.', category: 'hobby' },
      { name: 'Write/Journal for Hobby', description: 'Write about hobby progress or ideas.', category: 'hobby' },
      { name: 'Research Hobby Topic', description: 'Read articles or watch videos about the hobby.', category: 'hobby' },
      { name: 'Sketch/Doodle', description: 'Spend 10 minutes sketching or doodling.', category: 'hobby' },
      { name: 'Collect Item for Hobby', description: 'Find or acquire an item related to a collection hobby.', category: 'hobby' },
      { name: 'Join Hobby Community', description: 'Engage with online or local hobby group.', category: 'hobby' }
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
        // Randomize history parameters for each habit
        const randomDaysBack = Math.floor(Math.random() * (60 - 45 + 1)) + 45; // Between 45 and 60 days

        // Introduce more varied completion rates for diverse streaks
        let randomCompletionRate;

        // Force high completion rate if history length is long enough for stage 5
        if (randomDaysBack >= 50) {
          randomCompletionRate = Math.random() * (0.98 - 0.75) + 0.75; // 0.75 to 0.98 (High chance)
        } else { // Otherwise, use the varied modes
          const rateMode = Math.random();
          if (rateMode < 0.33) { // Low completion mode
            randomCompletionRate = Math.random() * (0.4 - 0.1) + 0.1; // 0.1 to 0.4
          } else if (rateMode < 0.66) { // Medium completion mode
            randomCompletionRate = Math.random() * (0.7 - 0.4) + 0.4; // 0.4 to 0.7
          } else { // High completion mode (but shorter history)
            randomCompletionRate = Math.random() * (0.9 - 0.7) + 0.7; // 0.7 to 0.9
          }
        }

        const history = generateRandomHistory(randomDaysBack, randomCompletionRate);
        const initialStreak = calculateStreakFromHistory(history);
        const lastCompletion = history.length > 0 ? history[history.length - 1] : null;

        const habit = new Habit({
          name: habitData.name,
          description: habitData.description,
          category: habitData.category,
          userId,
          goalId: savedGoal._id,
          frequency: 'daily',
          startDate: today, // Add start date
          endDate: endDate, // Add end date
          streak: initialStreak,
          completionHistory: history,
          lastCompleted: lastCompletion
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