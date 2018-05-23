const sqlite3 = require('sqlite3').verbose()
const express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , Youtube = require("youtube-api")
  , io = require('socket.io')(server)
  , gapi = require('./lib/gapi')
  , readJson = require("r-json")
  , Logger = require("bug-killer")
  , opn = require('opn')
  , Spinner = require('cli-spinner').Spinner
  , spinner = new Spinner('uploading.. %s')
spinner.setSpinnerString('|/-\\');


/*****************************************************
 *                      APP                          *
 ****************************************************/


app.use(express.static(__dirname + '/public'));
server.listen(5000, () => {
  console.log('Video Pond app initiated! - localhost:5000');
});


/*****************************************************
 *                    ROUTES                         *
 ****************************************************/


app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/public/views/index.html');
});


/*****************************************************
 *             SOCKET.IO EVENT LISTENERS            *
 ****************************************************/

let currentVideo = {};
var data = [];
let video_data = {};

io.on('connection', function (socket) {

  socket.on('start', function (video) {

    currentVideo = video
    var videoblob = videoblob
    var file_values = [currentVideo.firstname, currentVideo.lastname, currentVideo.gender, currentVideo.email, currentVideo.mobile];

    console.log(currentVideo.videourl);

    databaseInsert(file_values, videoblob);
    opn(gapi.oauth.generateAuthUrl({
      access_type: "offline"
      , scope: ["https://www.googleapis.com/auth/youtube.upload"]
    }));
    app.get('/oauth2callback', function (req, res) {
      let code = req.query.code;

      Logger.log("Trying to get the token using the following code: " + code);

      gapi.oauth.getToken(code, (err, tokens) => {

        if (err) {
          console.error(err)
          res.status(500).send(err)
          return Logger.log(err);
        }

        Logger.log("Got the tokens.");
        gapi.oauth.setCredentials(tokens);
        res.send("The video is being uploaded. Check out the logs in the terminal.");
        let req = Youtube.videos.insert({
          resource: {
            // Video title and description
            snippet: {
              title: currentVideo.title
              , description: currentVideo.description
            }

            , status: {
              privacyStatus: currentVideo.privacyStatus
            }
          }

          // This is for the callback function
          , part: "snippet,status"

          , media: {
            body: currentVideo.video
          }
        }, (err, data) => {
          if (data) {
            socket.emit('done', currentVideo);
            spinner.stop(true)
            Logger.log('Done!')
            console.log('\n Check your uploaded video using:\n https://www.youtube.com/watch?v=' + data.id);

          }
          if (err) {
            console.error(err)
          }
        });
        spinner.start();
      });
    });

  });
});


/*****************************************************
 *             DATABASE OPERATIONS         *
 ****************************************************/
function databaseInsert(data, video_data) {
  // open the database
  var user_id = 1;
  let db = new sqlite3.Database('./database/videopond.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the videopond database.');
  });
  var stmt = "INSERT INTO user_data(user_id,video) VALUES('" + user_id + "',\"" + video_data + "\")";
  db.run(stmt, function (err) {
    if (err) {
      return console.log(err.message);
    }
  });

  var stmt = "INSERT INTO user_details(name,surname,mobile,email,gender) VALUES('" + data[1] + "','" + data[2] + "','" + data[4] + "','" + data[5] + "','" + data[3] + "')";
  db.run(stmt, function (err) {
    if (err) {
      return console.log(err.message);
    }
  });
  db.close();
  console.log("Database operation successful");
  flag = 'no_data';
}