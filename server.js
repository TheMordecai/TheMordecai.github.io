var http = require("http");
var url = require("url");
var querystring = require("querystring");
var fs = require("fs");
var path = require("path");

//-- These are for session handling.
const {UserSession}  = require("./UserSession");
const crypto = require('crypto');
var sessions_map = require("./sessionhashmap");

function parseCookies (request) {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function(cookie) {
      let [ name, ...rest] = cookie.split(`=`);
      name = name?.trim();
      if (!name) return;
      const value = rest.join(`=`).trim();
      if (!value) return;
      list[name] = decodeURIComponent(value);
  });

  return list;
}

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
    let coks = parseCookies(request);
    let sessId = coks['sessionId'];
    let login_req = false;
    console.log("------------ from brower: " + sessId + " ------------");
    if(sessId && !sessions_map.auth.get(sessId)) {
      console.log("Deleting old session: " + sessId);
      sessId = null;
    }
    if(!sessId) {
      sessId = crypto.randomUUID();
      login_req = true;
      console.log("created uuid: " + sessId);
      var usession = new UserSession(sessId, "Ava", "Timpu");
      sessions_map.auth.set(sessId, usession);
    }
    let userSess = sessions_map.auth.get(sessId);
    // if(!userSess.getLoggedDT() || login_req) {
    //   requestHandlers.loginverify(request, response, userSess);
    //   return;
    // }
    console.log("session id: " + userSess.getSessonId());
    console.log("session user: " + userSess.getUserName());

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
      console.log("Request handling complete");
    });
  }
    // route(handle, pathname, response);
  }

  http.createServer(onRequest).listen(3000);
  console.log("Server has started.");
}

exports.start = start;