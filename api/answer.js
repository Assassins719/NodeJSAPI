const UTIL = require('../global/util.js');

var express = require('express');
var router = express.Router();
var db = require('firebase').database();

router.post('/add', (req, res) => {
  var uid = req.body.questionId;
  var answer = req.body;

  var m_date = new Date(); //Get current date time
  var m_miliseconds = m_date.getTime(); //make it to miliseconds
  uid += m_miliseconds; //Make uid with current + miliseconds
  answer.answerId = uid;
  answer.time = m_miliseconds;
  //Get Question first

  let queryQes = db.ref('question/' + answer.questionId);
  queryQes.once('value')
    .then(snapshot => {
      console.log("value:", snapshot.val().question);
      answer.question = snapshot.val().question
      //Set Anwer Value 
      db.ref('answer/' + uid).set(answer)
        .then(answer => {
          res.status(200).json({
            success: true,
            message: "Answer added successfully",
            answerId: uid
          });
        }).catch((err) => { 
          return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
        });
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });



  //Update Chatable friends
  var answeredId = answer.answeredUserId;
  var askedId = answer.askedUserId;
  console.log("askedId:", askedId, answeredId);
  var isFlag = false;
  let query = db.ref('answer/');
  query = query.orderByChild('answeredUserId').equalTo(askedId); //Get Questions that has same User ID
  query.once('value') //Get All Questions
    .then(snapshot => {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        console.log(childData);
        if (childData["askedUserId"] == answeredId) {
          isFlag = true;
        }
      });
      console.log(isFlag);
      if (isFlag == true) {
        //Add contact on one side
        var isExist = false;
        db.ref('chat/friends/' + answeredId).once("value")
          .then(userlist => {
            if (userlist.val() != null) {
              console.log("userlist", userlist.val());
              var useridlist = userlist.val();
              console.log(useridlist);
              for (var i = 0; i < useridlist.length; i++) {
                if (useridlist[i].uid == askedId) {
                  isExist = true;
                }
              }
              if (!isExist) {
                db.ref('users/' + askedId).once('value')
                  .then(snapshot => {
                    var user = snapshot.val();
                    var newUser = {
                      uid: askedId,
                      name: user.nick_name
                    }
                    useridlist.push(newUser);
                    db.ref('chat/friends/' + answeredId).set(useridlist)
                      .then(users => {
                        console.log("new friend added");
                      }).catch((err) => { });
                  })
                  .catch(e => {
                    return UTIL.responseHandler(res, false, "Cannot find User by uid:" + askedId, e);
                  });
              }
            }
            else {
              var new_friend = [];
              db.ref('users/' + askedId).once('value')
                .then(snapshot => {
                  var user = snapshot.val();
                  console.log("user", user);
                  var newUser = {
                    uid: askedId,
                    name: user.nick_name
                  }
                  new_friend.push(newUser);
                  db.ref('chat/friends/' + answeredId).set(new_friend)
                    .then(users => {
                      console.log("friend added");
                    }).catch((err) => { });
                })
                .catch(e => {
                  return UTIL.responseHandler(res, false, "Cannot find User by uid:" + askedId, e);
                });
            }
          }).catch((err) => { });
        //Add contact on the other side
        var isExistother = false;
        db.ref('chat/friends/' + askedId).once("value")
          .then(userlist => {
            if (userlist.val() != null) {
              console.log("userlist", userlist.val());
              var useridlist = userlist.val();
              console.log(useridlist);
              for (var i = 0; i < useridlist.length; i++) {
                if (useridlist[i].uid == answeredId) {
                  isExistother = true;
                }
              }
              if (!isExistother) {
                // useridlist.push(answeredId);
                // db.ref('chat/friends/' + askedId).set(useridlist)
                //   .then(users => {
                //     console.log("friend added");
                //   }).catch((err) => { });

                db.ref('users/' + answeredId).once('value')
                  .then(snapshot => {
                    var user = snapshot.val();
                    var newUser = {
                      uid: answeredId,
                      name: user.nick_name
                    }
                    useridlist.push(newUser);
                    db.ref('chat/friends/' + askedId).set(useridlist)
                      .then(users => {
                        console.log("new friend added");
                      }).catch((err) => { });
                  })
                  .catch(e => {
                    return UTIL.responseHandler(res, false, "Cannot find User by uid:" + answeredId, e);
                  });
              }
            }
            else {
              var new_friend = [];
              // new_friend.push(answeredId);
              // db.ref('chat/friends/' + askedId).set(new_friend)
              //   .then(users => {
              //     console.log("friend added");
              //   }).catch((err) => { });

              db.ref('users/' + answeredId).once('value')
                .then(snapshot => {
                  var user = snapshot.val();
                  var newUser = {
                    uid: answeredId,
                    name: user.nick_name
                  }
                  new_friend.push(newUser);
                  db.ref('chat/friends/' + askedId).set(new_friend)
                    .then(users => {
                      console.log("new friend added");
                    }).catch((err) => { });
                })
                .catch(e => {
                  return UTIL.responseHandler(res, false, "Cannot find User by uid:" + answeredId, e);
                });
            }
          }).catch((err) => { });
      }
    })
    .catch(e => {
      /*
      if (userlist.val() != null) {
        console.log("userlist", userlist.val());
        var useridlist = userlist.val();
        console.log(useridlist);
        for (var i = 0; i < useridlist.length; i++) {
          if (useridlist[i] == askedId) {
            isExist = true;
          }
        }
        if (!isExist) {
          useridlist.push(askedId);
          db.ref('chat/friends/' + answeredId).set(useridlist)
            .then(users => {
              console.log("friend added");
            }).catch((err) => { });
        }
      }
      else {
        var new_friend = [];
        new_friend.push(askedId);
        db.ref('chat/friends/' + answeredId).set(new_friend)
          .then(users => {
            console.log("friend added");
          }).catch((err) => { });
      }*/
    });
})

router.post('/get_by_question', (req, res) => {
  var questionId = req.body.questionId; //User Id
  console.log(questionId);
  let query = db.ref('answer/');
  query = query.orderByChild('questionId').equalTo(questionId); //Get Questions that has same User ID
  var answerArray = [];
  query.once('value')
    .then(snapshot => {
      console.log(snapshot.val());
      if (snapshot.val() != null) {
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          answerArray.push(childSnapshot.val());
        });
        answerArray.sort(function (a, b) {
          var keyA = a.time,
            keyB = b.time;
          // Compare the 2 dates
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
        return UTIL.responseHandler(res, true, "Get Questions Successfully ", answerArray);
      } else {
        // return UTIL.responseHandler(res, false, "No Answer");
        return UTIL.responseHandler(res, true, "No Answer", []);
      }
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request: " + firstOwnerId, e);
    });
})

router.post('/get_mine', (req, res) => {
  var userId = req.body.userId; //User Id
  console.log(userId);
  let query = db.ref('answer/');
  query = query.orderByChild('answeredUserId').equalTo(userId); //Get Questions that has same User ID
  var answerArray = [];
  query.once('value')
    .then(snapshot => {
      console.log(snapshot.val());
      if (snapshot.val() != null) {
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          answerArray.push(childSnapshot.val());
        });
        answerArray.sort(function (a, b) {
          var keyA = a.time,
            keyB = b.time;
          // Compare the 2 dates
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
        return UTIL.responseHandler(res, true, "Get Questions Successfully ", answerArray);
      } else {
        // return UTIL.responseHandler(res, false, "No Answer");
        return UTIL.responseHandler(res, false, "No Answer", []);
      }
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request: " + firstOwnerId, e);
    });
})
router.post('/get_other', (req, res) => {
  var userId = req.body.userId; //User Id
  console.log(userId);
  let query = db.ref('answer/');
  query = query.orderByChild('askedUserId').equalTo(userId); //Get Questions that has same User ID
  var answerArray = [];
  query.once('value')
    .then(snapshot => {
      console.log(snapshot.val());
      if (snapshot.val() != null) {
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          answerArray.push(childSnapshot.val());
        });
        answerArray.sort(function (a, b) {
          var keyA = a.time,
            keyB = b.time;
          // Compare the 2 dates
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
        return UTIL.responseHandler(res, true, "Get Questions Successfully ", answerArray);
      } else {
        // return UTIL.responseHandler(res, false, "No Answer");
        return UTIL.responseHandler(res, true, "No Answer", []);
      }
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request: " + firstOwnerId, e);
    });
})
module.exports = router;