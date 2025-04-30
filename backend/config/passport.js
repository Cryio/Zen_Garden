const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    proxy: true, // Enable proxy support
    state: true // Enable state parameter to prevent CSRF
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      console.log('Processing Google authentication for:', email);
      
      // First check if user exists with Google ID
      let user = await User.findOne({ googleId: profile.id }).select('+password');
      
      if (!user) {
        // If no user with Google ID, check if user exists with email
        user = await User.findOne({ email: email }).select('+password');
        
        if (user) {
          // If user exists with email, link Google account to it
          user.googleId = profile.id;
          user.isGoogleUser = true;
          await user.save();
        } else {
          // Create new user if doesn't exist
          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            isGoogleUser: true,
            firstName: profile.name?.givenName || 'Google',
            lastName: profile.name?.familyName || 'User',
            gender: 'other',
            dob: new Date('2000-01-01'),
            password: 'google-auth'
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      console.error('passport strategy error: ', error);
      return done(error, null);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('+password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 