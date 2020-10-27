'use strict';

require("dotenv").config();

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 


const shorturlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Shorturl = mongoose.model('shorturl', shorturlSchema);

// DB_URI="mongodb+srv://rahul:FGlgBXxnChDNVsUy@cluster0.2t1xd.mongodb.net/merng"

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  console.log("Mongo Connected.");
});



app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

async function processQuery(url) {

  // find if url exists in the database. Then return the new url
 
  var result = await Shorturl.findOne({original_url: url});
  if (result !== null){
    return {
      original_url: url,
      short_url: result.short_url
    };
  }

  // if it doesn't exists find the max_id and plus one 
  // create a new document.

  var result = await Shorturl
  .find({})
  .sort('-short_url')
  .limit(1);

  var max_count = result[0].short_url

  await Shorturl.create({
    original_url: url,
    short_url: max_count+1
  });
  return {
    original_url: url,
    short_url: max_count + 1
  };
}
  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  // extract the url 
  var url = req.body.url;
  processQuery(url).then((response) => {
    res.json(response);
  })
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});