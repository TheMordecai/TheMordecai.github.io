var http = require("http");
var url = require("url");
var querystring = require("querystring");
var fs = require("fs");
var path = require("path");

//-- These are for session handling.
//const {UserSession}  = require("./UserSession");
//const crypto = require('crypto');
//var sessions_map = require("./sessionhashmap");

function start(route, handle) {
  function onRequest(request, response) {
    var postData = ""; // new
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    if(pathname === "/favicon.ico") {
      let frstream = fs.readFileSync("./favicon.ico");
      console.log("--------- Serving favicon.ico");
      response.statusCode = "200";
      response.setHeader("Content-Type", "image/jpeg");
      //frstream.pipe(response);
      response.end(frstream);
      return;          
    }

    if (pathname.startsWith("/public/")) {
      var filePath = path.join(__dirname, pathname);
      fs.readFile(filePath, function(err, data) {
        if (err) {
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write("404 Not Found\n");
          response.end();
        } else {
          var contentType;
          if (pathname.endsWith(".css")) {
            contentType = "text/css";
          } else if (pathname.endsWith(".js")) {
            contentType = "text/javascript";
          } else {
            contentType = "text/plain";
          }
          response.writeHead(200, {"Content-Type": contentType});
          response.write(data);
          response.end();
        }
      });
    }
    else{
    request.setEncoding("utf8"); //new

    request.addListener("data", function(chunk) { //new
      postData += chunk;
    });

    request.addListener("end", function() {
      route(handle, pathname, response, postData); //new
    });
  }
    // route(handle, pathname, response);
  }

  http.createServer(onRequest).listen(3000);
  console.log("Server has started.");
}

exports.start = start;