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
var fs = require('fs');
var content;
var videourl;
var filePath = __dirname +'/public/upload/video/tmp.mp4';
var imgPath = '/public/upload/image/tmp.mp4';
var ranId ;
const uuidv4 = require('uuid/v4');


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

app.post('/upload', function (req, resp) {

  req.on('data', function (chunk) {
    fs.appendFile(__dirname + '/public/upload/video/tmp.mp4', chunk, function (err) {
      if (err) throw err;
    });
    });
  });

  /*****************************************************
   *                    FILE OPERATION                         *
   ****************************************************/
  function fileReader() {
    fs.readFile(__dirname +'/public/upload/video/tmp.mp4', function read(err, data) {
      if (err) {
        throw err;
      }
      content = data;
    });
  }
  
  function fileDelete() {
    fs.unlinkSync(filePath)
  }
  /*****************************************************
   *             SOCKET.IO EVENT LISTENERS            *
   ****************************************************/

  let currentVideo = {};
  var data = [];

  io.on('connection', function (socket) {

    socket.on('start', function (video) {

      currentVideo = video
      var image = currentVideo.video;
      
      fileReader();
      fs.writeFile(__dirname + '/public/upload/image/tmp.jpg', video, function (err) {
        if (err) throw err;
      });

      var file_values = [currentVideo.firstname, currentVideo.lastname, currentVideo.mobile, currentVideo.email,currentVideo.gender ];
    
console.log(file_values);
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
          res.send("The video is being uploaded successfully. The Magic Begins.......");
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
              body: content
            }
          }, (err, data) => {
            if (data) {
              socket.emit('done', currentVideo);
              spinner.stop(true)
              Logger.log('Done!')
              console.log('\n Check your uploaded video using:\n https://www.youtube.com/watch?v=' + data.id);
              videourl = 'https://www.youtube.com/watch?v=' + data.id;
              databaseInsert(file_values,videourl,imgPath);
              fileDelete(filePath);
              

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
  function databaseInsert(file_values, videourl,imgPath) {
    // open the database
    ranId=uuidv4();
    var user_id = ranId;
    let db = new sqlite3.Database('./database/videopond.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the videopond database.');
    });

    var stmt = "INSERT INTO user_details(name,surname,mobile,email,gender,video_url,photo_url) VALUES('" + file_values[0] + "','" + file_values[1] + "','" + file_values[2] + "','" + file_values[3] + "','" + file_values[4] + "','" + videourl + "','" + imgPath + "')";
    db.run(stmt, function (err) {
      if (err) {
        return console.log(err.message);
      }
    });
    db.close();
    console.log("Database operation successful");
    flag = 'no_data';
  }