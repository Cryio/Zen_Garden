const { seedDataForUser } = require('./seedSampleData');

// The user ID from the error message
const userId = '6807f20038cdd52c02de9cde';

// Run seed function for this specific user
seedDataForUser(userId)
  .then(success => {
    if (success) {
      console.log('✅ Sample data successfully added to the database!');
      console.log('Now you should be able to see sample habits and goals in your dashboard.');
    } else {
      console.log('❌ Failed to add sample data.');
      console.log('Please check if the user ID exists and try again.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Error running seed script:', err);
    process.exit(1);
  }); 