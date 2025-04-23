const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Goal = require('../backend/models/Goal');
const Habit = require('../backend/models/Habit');
const User = require('../backend/models/User');

// Load environment variables
dotenv.config();

// Connect to database - use the same default connection string from backend/config/database.js
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zen_garden')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data organized by categories
const sampleData = {
  health: {
    goalName: 'Improve Physical Health',
    goalDescription: 'Focus on regular exercise and healthy eating habits',
    habits: [
      { name: 'Breakfast', description: 'Eat a nutritious breakfast every morning', category: 'health' },
      { name: 'Exercise', description: 'Minimum 30 minutes of physical activity', category: 'health' },
      { name: 'Evening Walk', description: '15-minute walk after dinner', category: 'health' },
      { name: 'Stretching', description: 'Morning stretching routine', category: 'health' }
    ]
  },
  mindfulness: {
    goalName: 'Practice Mindfulness',
    goalDescription: 'Incorporate mindfulness practices into daily routine',
    habits: [
      { name: 'Morning Meditation', description: '10 minutes of meditation after waking up', category: 'mindfulness' },
      { name: 'Journal Writing', description: 'Record thoughts and reflections', category: 'mindfulness' }
    ]
  },
  learning: {
    goalName: 'Continuous Learning',
    goalDescription: 'Dedicate time to learn new skills and knowledge',
    habits: [
      { name: 'Read 30 mins', description: 'Read books or articles for at least 30 minutes', category: 'learning' },
      { name: 'Study Mathematics', description: 'Practice math problems or learn new concepts', category: 'learning' },
      { name: 'Practice Programming', description: 'Coding practice and projects', category: 'learning' },
      { name: 'Language Practice', description: 'Practice foreign language skills', category: 'learning' }
    ]
  },
  productivity: {
    goalName: 'Boost Productivity',
    goalDescription: 'Improve daily organization and productivity',
    habits: [
      { name: 'Plan Tomorrow', description: 'Set goals and tasks for the next day', category: 'productivity' },
      { name: 'Water Plants', description: 'Maintain indoor plants and garden', category: 'self-care' }
    ]
  }
};

// Function to seed data for a specific user
async function seedDataForUser(userId) {
  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return false;
    }

    console.log(`Creating sample data for user: ${user.firstName} ${user.lastName}`);
    
    // Clear existing goals and habits for this user to avoid duplicates
    await Goal.deleteMany({ userId });
    await Habit.deleteMany({ userId });
    
    // Create goals and habits for each category
    for (const [category, data] of Object.entries(sampleData)) {
      // Create goal
      const goal = new Goal({
        name: data.goalName,
        description: data.goalDescription,
        userId,
        frequency: 'daily',
      });
      
      await goal.save();
      console.log(`Created goal: ${data.goalName}`);
      
      // Create habits for this goal
      for (const habitData of data.habits) {
        const habit = new Habit({
          name: habitData.name,
          description: habitData.description,
          category: habitData.category,
          userId,
          goalId: goal._id,
          frequency: 'daily',
          completionHistory: Array(7).fill(false)
        });
        
        await habit.save();
        
        // Add habit to goal's habits array
        goal.habits.push(habit._id);
        console.log(`Added habit: ${habitData.name} to goal: ${data.goalName}`);
      }
      
      // Save updated goal with habit references
      await goal.save();
    }
    
    console.log(`Sample data created successfully for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  // Check if user ID was provided as command line argument
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('Please provide a user ID as a command line argument');
    console.log('Usage: node seedSampleData.js <userId>');
    process.exit(1);
  }
  
  seedDataForUser(userId)
    .then(success => {
      if (success) {
        console.log('Sample data creation completed successfully');
      } else {
        console.log('Failed to create sample data');
      }
      mongoose.connection.close();
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Error in sample data creation:', err);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = { seedDataForUser }; 