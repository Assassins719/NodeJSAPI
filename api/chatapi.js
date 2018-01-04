const UTIL = require('../global/util.js');
var express = require('express');
var router = express.Router();
var db = require('firebase').database();

// =======Get Friends=======
router.post('/friends/:uid', (req, res) => {
  var userId = req.params.uid
  db.ref('chat/friends/' + userId).once('value')
    .then(snapshot => {
      console.log("friends", snapshot.val());
      if (snapshot.val() != null) {
        idList = snapshot.val();
        // for(var i = 0; idList.length; i ++)
        // {
        //   db.ref('chat/friends/' + userId).once('value')
        // }
        return UTIL.responseHandler(res, true, "Get Friends Successfully ", snapshot.val());
      }
      else {
        return UTIL.responseHandler(res, true, "Get Friends Successfully", []);
      }
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });
})
/* Old API to get Friends
router.post('/friends/:uid', (req, res) => {
  var userId = req.params.uid
  db.ref('chat/friends/' + userId).once('value')
    .then(snapshot => {
      console.log("friends", snapshot.val());
      if (snapshot.val() != null) {
        idList = snapshot.val();
        // for(var i = 0; idList.length; i ++)
        // {
        //   db.ref('chat/friends/' + userId).once('value')
        // }
        return UTIL.responseHandler(res, true, "Get Friends Successfully ", snapshot.val());
      }
      else {
        return UTIL.responseHandler(res, false, "No friend List", null);
      }
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });
})
*/

router.post('/chatting/send/', (req, res) => {
  console.log("data", req.body);
  var userId = req.body.userId;
  var friendId = req.body.friendId;
  var message = req.body.message;
  var fieldUid = "";
  if (userId > friendId) {
    console.log("userBig");
    fieldUid = userId + friendId;
  }
  else {
    console.log("friendBig")
    fieldUid = friendId + userId;
  }
  db.ref('chat/chatting/' + fieldUid).push({
    from: userId,
    msg: message
  }).then(function () {
    return UTIL.responseHandler(res, true, "Send Success");
  })
    .catch(function (error) {
      return UTIL.responseHandler(res, false, "Send Failed");
    });;
})
router.post('/chatting/receive/', (req, res) => {
  var userId = req.body.userId;
  var friendId = req.body.friendId;
  var fieldUid = "";
  if (userId > friendId) {
    console.log("userBig");
    fieldUid = userId + friendId;
  }
  else {
    console.log("friendBig")
    fieldUid = friendId + userId;
  }

  var ref = db.ref('chat/chatting/' + fieldUid);
  ref.on("child_added", function (snapshot, prevChildKey) {
    var newPost = snapshot.val();
    console.log("From: " + newPost.from);
    console.log("Message: " + newPost.msg);
    console.log("Previous Post ID: " + prevChildKey);     
     //send multiple responses to the client     
      //  res.write({new:newPost.msg});     
  });
})

module.exports = router;