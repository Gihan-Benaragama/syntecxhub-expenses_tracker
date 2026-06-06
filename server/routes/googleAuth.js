import express from 'express';
import passport from 'passport';

const router = express.Router();

const isGoogleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET';

// Initiate Google OAuth login
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.status(503).json({
      message: 'Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google callback – on success redirect with token in query string
router.get('/google/callback', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=google_not_configured`);
  }
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}?error=google_auth_failed` })(req, res, (err) => {
    if (err) return next(err);
    const { _id, name, email, token } = req.user;
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}&id=${_id}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
    res.redirect(redirectUrl);
  });
});

export default router;
