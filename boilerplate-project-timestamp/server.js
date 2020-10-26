// server.js
// where your node app starts
require('dotenv').config()

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/api/timestamp", (req, res) => {
  var now = new Date();
  res.json({unix: Date.parse(now), utc: now.toUTCString()});
})
// your first API endpoint... 
app.get("/api/timestamp/:date_string", function (req, res) { 
  let date_string = req.params.date_string;
  
  var unix_ts = NaN;
  if(! isNaN(Date.parse(date_string))){
    unix_ts = Date.parse(date_string);
  }
  else if(! isNaN(parseInt(date_string) !== NaN)){
    unix_ts = parseInt(date_string);
  }
  else {
    return res.json({error: "Invalid Date"});
  }
  console.log(date_string, Date.parse(date_string), parseInt(date_string));
  console.log(unix_ts);
  res.json({unix: unix_ts, utc: new Date(unix_ts).toUTCString()});
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
