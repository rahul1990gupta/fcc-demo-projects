const passport = require("passport");
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require("bcrypt");


module.exports = function (app, myDataBase) {
  passport.use(new LocalStrategy(
    function(username, password, done){
      myDataBase.findOne({username: username}, (err, user) => {
        console.log('User' + username + ' attempted to log in.');
        if(err) {return done(err); }
        if(!user) { return done(null, false); }
        if(!bcrypt.compareSync(password, user.password)) { 
          return done(null, false)
        }
        return done(null, user);
      })
    }
  ))
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://b02c1b450961.ngrok.io/auth/github/callback'
  },
    function(accessToken, refreshToken, profile, cb){
      console.log(profile);
    }
  ));
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
    
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({_id: new ObjectID(id)}, (err, doc) => {
      done(null, doc);
    })
  });    
}