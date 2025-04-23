const mongoose = require('mongoose');
const User = require('../backend/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zen_garden')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  gender: 'other',
  dob: new Date('1990-01-01'),
  password: 'password123'
};

async function createTestUser() {
  try {
    // Check if user with this email already exists
    let user = await User.findOne({ email: testUser.email });
    
    if (user) {
      console.log('Test user already exists in the database:');
      console.log('User ID:', user._id);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Email:', user.email);
      
      // Generate a new token for the existing user
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: "24h", // Longer expiration for testing
      });
      
      console.log('\nAuthentication Token (copy this for testing):');
      console.log(token);
      
      return user;
    }
    
    // If user doesn't exist, create new user
    console.log('Creating new test user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    
    user = new User({
      ...testUser,
      password: hashedPassword
    });
    
    await user.save();
    
    console.log('✅ Test user created successfully!');
    console.log('User ID:', user._id);
    console.log('Name:', user.firstName, user.lastName);
    console.log('Email:', user.email);
    console.log('Password:', testUser.password, '(unhashed for your reference)');
    
    // Generate a token for the new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: "24h", // Longer expiration for testing
    });
    
    console.log('\nAuthentication Token (copy this for testing):');
    console.log(token);
    
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
    return null;
  }
}

// Run the function
createTestUser()
  .then(user => {
    if (user) {
      console.log('\nNow you can run the seed script with:');
      console.log(`node seedSampleData.js ${user._id}`);
    }
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
    process.exit(1);
  }); 