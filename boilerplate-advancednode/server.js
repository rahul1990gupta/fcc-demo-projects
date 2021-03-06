'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const passport = require("passport");
const session = require("express-session");


const routes = require('./routes.js');
const auth = require("./auth");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {secure: false}
}));
app.use(passport.initialize());
app.use(passport.session());


myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  console.log("Database connected.");

  routes(app, myDataBase);
  auth(app, myDataBase);

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: e,
      message: 'Unable to login'
    })
  })
})

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', socket => {
  console.log('A user has connected');
});


http.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + process.env.PORT);
});
