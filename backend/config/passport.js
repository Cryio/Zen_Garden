const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      console.log('Google profile:', {
        id: profile.id,
        email: email,
        displayName: profile.displayName
      });
      
      // First check if user exists with Google ID
      let user = await User.findOne({ googleId: profile.id });
      console.log('User with Google ID:', user ? {
        id: user._id,
        email: user.email,
        isGoogleUser: user.isGoogleUser,
        hasPassword: !!user.password
      } : 'Not found');
      
      if (!user) {
        // If no user with Google ID, check if user exists with email
        user = await User.findOne({ email: email });
        console.log('User with email:', user ? {
          id: user._id,
          email: user.email,
          isGoogleUser: user.isGoogleUser,
          hasPassword: !!user.password
        } : 'Not found');
        
        if (user) {
          // If user exists with email, link Google account to it
          console.log('Linking Google account to existing user');
          // Only set isGoogleUser if it wasn't already a Google user
          if (!user.isGoogleUser) {
            user.isGoogleUser = true;
          }
          user.googleId = profile.id;
          await user.save();
          console.log('Updated user:', {
            id: user._id,
            email: user.email,
            isGoogleUser: user.isGoogleUser,
            hasPassword: !!user.password
          });
        } else {
          // Create new user if doesn't exist
          console.log('Creating new Google user');
          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            isGoogleUser: true,
            // Set default values for required fields
            firstName: profile.name?.givenName || 'Google',
            lastName: profile.name?.familyName || 'User',
            gender: 'other', // Default value
            dob: new Date('2000-01-01'), // Default value
            password: 'google-auth' // Dummy password for Google users
          });
          console.log('Created new user:', {
            id: user._id,
            email: user.email,
            isGoogleUser: user.isGoogleUser,
            hasPassword: !!user.password
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

passport.serializeUser((user, done) => {
  console.log('serializeUser: ', user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 