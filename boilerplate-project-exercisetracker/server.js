require("dotenv").config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const querystring = require('querystring');

/** Models */

const usernameSchema = mongoose.Schema({
  username: String
});

const Username = mongoose.model('username', usernameSchema);

const exerciseSchema = mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Number
});

const Exercise = mongoose.model('exercise', exerciseSchema);

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track').then(() => {
   console.log("MongoDB connected.");
 });

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

async function findOrCreate(username, res){
  const user = await Username.findOne({username: username});
  if(user) return res.send("username is already taken");
  else {
    const user = await Username.create({
      username: username
    });
    res.json(user);
  }
}
app.post("/api/exercise/new-user", (req, res) => {

  const username = req.body.username;
  // if doesn't exist in the database, create it.

  findOrCreate(username, res);
})

app.post("/api/exercise/add", (req, res) => {
  const userId = req.body.userId;
  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date;
  
  if(!parseInt(duration)){ 
    return res.send("Duration is invalid");
  }
  if(Date.parse(date)){
    date = Date.parse(date);
  }
  else {
    res.send("invalid Date");
  }

  Username.findById(userId).then((user) => {
    Exercise.create({
      userId: user._id,
      description: description,
      duration: duration,
      date: date
    }).then((exercise) => {
      res.json(exercise);
    })
  }).catch((err) => {
    res.send("Invalid userId");
  })

})

app.get("/api/exercise/log", (req, res) => {
  /*
  GET users's exercise log: 
  GET /api/exercise/log?{userId}[&from][&to][&limit]
  */
  console.log(req.query);
  const userId = req.query.userId;

  let query = {userId: userId, date: {}};
  if(req.query.from){ 
    Object.assign(
      query.date, 
      {$gte: Date.parse(req.query.from)}
    );
  }
  if(req.query.to){
    Object.assign(
      query.date, 
      {$lte: Date.parse(req.query.to)}
    );
  }
  const limit = parseInt(req.query.limit) || 10000;
  
  Exercise.find(query)
  .limit(limit)
  .then((results) => {
    res.json(results);
  });

})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
