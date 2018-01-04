var logger = require('morgan');
var cors = require('cors');
var express = require('express');

var errorhandler = require('errorhandler');
var dotenv = require('dotenv');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./global/config');
var session = require('express-session');
var path = require('path');


// Firebase Initiailize
var firebase = require("firebase");
firebase.initializeApp(config.FIREBASE_CONFIG);
var db = firebase.database();
// Requrie apis
var userHandler = require('./api/user.js');
var questionHandler = require('./api/question.js');
var answerHandler = require('./api/answer.js');
var rateHandler = require('./api/rate.js');
var reportHandler = require('./api/report.js');
var chatHandler = require('./api/chatapi.js');
var historyHandler = require('./api/historyapi.js');
var clientHandler = require('./router.js');

var app = express();

//View Engine
app.set('views', path.join(__dirname, './dist'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Embed File server
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, './dist')));

dotenv.load();

app.use(session({
  secret: 'keyboard cat',
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());
app.use(cookieParser());

app.use(function (err, req, res, next) {
  if (err.name === 'StatusError') {
    res.send(err.status, err.message);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(err);
  }
});

if (process.env.NODE_ENV === 'development') {
  app.use(express.logger('dev'));
  app.use(errorhandler());
}

app.use('/account', userHandler);
app.use('/question', questionHandler);
app.use('/answer', answerHandler);
app.use('/report', reportHandler);
app.use('/rate', rateHandler);
app.use('/chat', chatHandler);
app.use('/history', historyHandler);
app.use('/*', clientHandler);

var port = process.env.PORT || 80;

var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(port, function (err) {
  console.log('listening on port:' + port);
});

var userList = {};
var typingUsers = {};

io.on('connection', function (clientSocket) {
  console.log('A user connected');

  clientSocket.on('disconnect', function () {
    console.log('user disconnected');
    for (let userKey in userList) {
      console.log(userList[userKey].socketId);
      if (userList[userKey].socketId = clientSocket.id) {
        userList[userKey].isConnected = false;
        break;
      }
    }
    // var clientNickname;
    // for (var i = 0; i < userList.length; i++) {
    //   if (userList[i]["id"] == clientSocket.id) {
    //     userList[i]["isConnected"] = false;
    //     clientNickname = userList[i]["nickname"];
    //     break;
    //   }
    // }

    // delete typingUsers[clientNickname];
    // io.emit("userList", userList);
    // io.emit("userExitUpdate", clientNickname);
    // io.emit("userTypingUpdate", typingUsers);
    io.emit("userConnectUpdate", userList);
  });


  clientSocket.on("exitUser", function (userId) {
    for (var i = 0; i < userList.length; i++) {
      if (userList[i]["id"] == clientSocket.id) {
        userList.splice(i, 1);
        break;
      }
    }
    io.emit("userExitUpdate", userId);
  });


  clientSocket.on('chatMessage', function (fromUserId, toUserId, message) {


    try {
      var currentDateTime = new Date().toLocaleString();
      var userId = fromUserId;
      var friendId = toUserId;
      var message = message;
      var fieldUid = "";
      if (userId > friendId) {
        console.log("userBig");
        fieldUid = userId + friendId;
      }
      else {
        console.log("friendBig")
        fieldUid = friendId + userId;
      }
      var m_date = new Date(); //Get current date time
      var m_miliseconds = m_date.getTime(); //make it to miliseconds
      db.ref('chat/chatting/' + fieldUid).push({
        from: userId,
        msg: message,
        time: m_miliseconds
      }).then(function () {
      })
        .catch(function (error) {
        });
    } catch (ex) {
      console.log("Error");
    }
    try{
      io.to(userList[toUserId].socketId).emit("userTypingUpdate", { from: fromUserId, status: false });
      io.to(userList[toUserId].socketId).emit('newChatMessage', { message: message, from: fromUserId });
    }catch(ex){}
  });


  clientSocket.on("connectUser", function (userId) {
    var message = "User " + userId + " was connected.";
    console.log(message);
    userList[userId] = { socketId: clientSocket.id, isConnected: true, nickName: userId };
    console.log(userList);
    // var userInfo = {};
    // var foundUser = false;
    // for (var i = 0; i < userList.length; i++) {
    //   if (userList[i]["nickname"] == clientNickname) {
    //     userList[i]["isConnected"] = true
    //     userList[i]["id"] = clientSocket.id;
    //     userInfo = userList[i];
    //     foundUser = true;
    //     break;
    //   }
    // }

    // if (!foundUser) {
    //   userInfo["id"] = clientSocket.id;
    //   userInfo["nickname"] = clientNickname;
    //   userInfo["isConnected"] = true

    //   userList.push(userInfo);
    //   console.log(userList);
    // }

    // io.emit("userList", userList);
    // io.emit("userConnectUpdate", userInfo)
    io.emit("userConnectUpdate", userList);
  });


  clientSocket.on("startType", function (fromUserId, toUserId) {
    console.log("User " + fromUserId + " is writing a message...");
    io.to(userList[toUserId].socketId).emit("userTypingUpdate", { from: fromUserId, status: true });
  });


  clientSocket.on("stopType", function (fromUserId, toUserId) {
    console.log("User " + fromUserId + " is writing a message...");
    io.to(userList[toUserId].socketId).emit("userTypingUpdate", { from: fromUserId, status: false });
  });
});
