// http://localhost:9001
var data;

var server = require('http'),
    url = require('url'),
    path = require('path'),
    util = require('util'),
    formidable=require('formidable'),
    fs = require('fs');
    const sqlite3 = require('sqlite3').verbose();

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);
        var fields=[],files=[];

        // sms integrated code starts
       
            var form = new formidable.IncomingForm();
          
            
          form.on('error', function(err){
            response.writeHead(200, {'content-type': 'text/plain'});
        response.end('error:\n\n' + util.inspect(err));
          });
        
          form.on('field', function(field, value){
            console.log('1:: '+field, value);
           fields.push([value]);
          });
        
          form.on('file', function(field, file){
           console.log('2::: '+field, file);
            files.push([field, file]);
           
            files.push(file);
            
      
          
          
           
           
           
          });
        
          form.on('end', function(){
     
            
            response.writeHead(200, {'content-type': 'text/plain'});
  

                if(fields[0]=='user_details') 
                {databaseInsert(fields,'user_details','');}
                else if(fields[0]=='user_data') {
                    databaseInsert(util.inspect(files),'user_data',fields[1]);
                }
         
          });
        
          form.encoding = 'utf-8';
          form.uploadDir = './tmp';
          form.keepExtensions = true;
          form.parse(request);
         
      
     

        //sms integrated code ends

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (filename.indexOf('favicon.ico') !== -1) {
            return;
        }

        var isWin = !!process.platform.match(/^win/);

        if (fs.statSync(filename).isDirectory() && !isWin) {
            filename += '/index.html';
        } else if (fs.statSync(filename).isDirectory() && !!isWin) {
            filename += '\\index.html';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write(err + '\n');
                response.end();
                return;
            }

            var contentType;

            if (filename.indexOf('.html') !== -1) {
                contentType = 'text/html';
            }

            if (filename.indexOf('.js') !== -1) {
                contentType = 'application/javascript';
            }

            if (contentType) {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
            } else response.writeHead(200);

            response.write(file, 'binary');
            response.end();
        });
    });
}

var app;

app = server.createServer(serverHandler);

app = app.listen(process.env.PORT || 9001, process.env.IP || "0.0.0.0", function() {
    var addr = app.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});



function databaseInsert(filer,tname,user_id)
{ console.log("ninde than"+filer);
    // open the database
    let db = new sqlite3.Database('./db/user_data.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the local database.');
    });
   // let db = new sqlite3.Database('./db/sample.db');
     if (tname=='user_data'){
        console.log("Inserting video for user"+user_id);
        var stmt="INSERT INTO user_data(user_id,video) VALUES('"+user_id+"',\""+filer+"\")";
        //var stmt = db.prepare("INSERT INTO user_data(user_id,video) VALUES (?,?)");
       console.log(stmt);
       //stmt.run(user_id,'tea');
       //stmt.finalize();
        db.run(stmt,function(err){
      // db.run(`INSERT INTO user_data(user_id,video) VALUES(?,?)`,['+user_id+',filer], function(err) {
            if (err) {
             return console.log(err.message);
           }});
        }
            // get the last insert id
    else if (tname=='user_details'){
       var stmt="INSERT INTO user_details(name,surname,mobile,email,gender) VALUES('"+filer[1]+"','"+filer[2]+"','"+filer[3]+"','"+filer[4]+"','"+filer[5]+"')";
       db.run(stmt,function(err){
       //db.run(`INSERT INTO user_details(name,surname,mobile,email) VALUES(?,?,?,?)`,[filer[1],filer[2],filer[3],filer[4]], function(err) {
                if (err) {
                  return console.log(err.message);
                }
          });
         
          // close the database connection
          db.close();

     }
      
flag='no_data';
}