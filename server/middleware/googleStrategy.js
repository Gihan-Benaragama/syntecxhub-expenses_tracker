import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Ensure environment variables are set
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

const isGoogleConfigured =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
  GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_SECRET !== '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';

if (!isGoogleConfigured) {
  console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google sign-in.');
} else {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/users/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract email and name from Google profile
      const email = profile.emails?.[0]?.value?.toLowerCase();
      const name = profile.displayName || profile.name?.givenName || 'GoogleUser';

      if (!email) {
        return done(null, false, { message: 'No email found in Google profile' });
      }

      // Find existing user or create a new one
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email, password: '' }); // Password empty for OAuth users
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      const userData = { _id: user._id, name: user.name, email: user.email, token };
      return done(null, userData);
    } catch (err) {
      return done(err, null);
    }
  }));
}

// Serialize/deserialize (not needed for JWT, but required by passport)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
