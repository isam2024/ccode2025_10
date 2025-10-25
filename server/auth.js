const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure passport to use Google OAuth
function configureAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        // Here you would typically save user to database
        // For now, we'll just pass the profile
        const user = {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
          photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          accessToken,
        };
        return done(null, user);
      }
    )
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from the session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = {
  configureAuth,
  ensureAuthenticated,
  passport,
};
