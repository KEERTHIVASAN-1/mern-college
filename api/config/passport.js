const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Get teacher email whitelist from environment
const getTeacherEmails = () => {
  const emails = process.env.TEACHER_EMAILS || '';
  return emails.split(',').map(email => email.trim().toLowerCase()).filter(email => email);
};

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user and update role if needed
        user.googleId = profile.id;
        user.avatar = profile.photos[0]?.value || user.avatar;
        user.lastLogin = new Date();
        
        // Check if user role should be updated based on email whitelist
        const userEmail = profile.emails[0].value.toLowerCase();
        const teacherEmails = getTeacherEmails();
        const shouldBeTeacher = teacherEmails.includes(userEmail);
        
        console.log('🔍 Role check for existing user:', {
          userEmail,
          teacherEmails,
          shouldBeTeacher,
          currentRole: user.role
        });
        
        // Update role if user should be teacher but isn't
        if (shouldBeTeacher && user.role === 'student') {
          user.role = 'teacher';
          console.log(`✅ Updated user ${user.email} role to teacher`);
        } else if (shouldBeTeacher && user.role === 'teacher') {
          console.log(`✅ User ${user.email} is already a teacher`);
        } else {
          console.log(`ℹ️ User ${user.email} remains as ${user.role}`);
        }
        
        await user.save();
        return done(null, user);
      }

      // Determine user role based on email whitelist
      const userEmail = profile.emails[0].value.toLowerCase();
      const teacherEmails = getTeacherEmails();
      const userRole = teacherEmails.includes(userEmail) ? 'teacher' : 'student';
      
      console.log('🔍 Role check for new user:', {
        userEmail,
        teacherEmails,
        userRole
      });

      // Create new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value || '',
        role: userRole,
        lastLogin: new Date()
      });

      await user.save();
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('⚠️  Google OAuth credentials not found. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
