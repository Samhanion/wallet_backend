const passport = require("passport");
const TwitterStrategy = require("passport-twitter");
const key = require("./keys.js");

passport.use(
  new TwitterStrategy(
    {
      consumerKey: key.consumerKey,
      consumerSecret: key.consumerSecret,
      callbackURL: "http://127.0.0.1:3000/auth/callback",
    },
    // function (token, tokenSecret, profile, cb) {
    // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    // },
  ),
);
