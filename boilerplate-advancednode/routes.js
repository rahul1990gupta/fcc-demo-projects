const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = function (app, myDataBase){
  app.route('/').get((req, res) => {
    console.log("accessing route /");
    res.render(__dirname +'/views/pug/', {
        title: 'Connected to Database',
        showLogin: true,
        showRegistration: true,
        showSocialAuth: true,
        message: 'Please login'
    });
  });
  app.get("/auth/github", (req, res) => {
    console.log("inside /auth/github");
    passport.authenticate('github');
  });

  app.get("/auth/github/callback", 
    passport.authenticate('github', { failureRedirect: '/' }), 
    (req, res) => {
      console.log("inside /auth/github/callback");
      res.redirect('/profile');

      myDataBase.findOneAndUpdate(
        { id: profile.id },
        {
          $setOnInsert: {
            id: profile.id,
            name: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails)
              ? profile.emails[0].value
              : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          },
          $set: {
            last_login: new Date()
          },
          $inc: {
            login_count: 1
          }
        },
        { upsert: true, new: true },
        (err, doc) => {
          return cb(null, doc.value);
        }
      );
  });

  app.route("/register")
  .post((req, res, next) => {
      myDataBase.findOne({username: req.body.username}, function(err, user){
      if(err) {
          next(err);
      } else if (user){
          res.redirect('/');
      } else {
          const hash = bcrypt.hashSync(req.body.password, 12);
          myDataBase.insertOne({
          username: req.body.username,
          password: hash
          },
          (err, doc) => {
              if(err) {
              res.redirect('/');
              } else {
              next(null, doc.ops[0]);
              }
          }
          )
      }
      })
  },
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => {
      res.redirect('/profile');
  }
  );

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
  };
  
  app.post(
    '/login', 
    passport.authenticate('local', {failureRedirect: '/'}), 
    (req, res) => {
        res.redirect('/profile')
    });
    app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(__dirname + '/views/pug/profile', {
        username: req.user.username
    });
  });

  app.route('/logout')
    .get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.use((req, res, next) => {
    res.status(404)
        .type('text')
        .send('Not Found');
  });
}