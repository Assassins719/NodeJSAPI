const UTIL = require('../global/util.js');

var express = require('express');
var router = express.Router();
var db = require('firebase').database();

router.post('/add', (req, res) => { //save question with userid+timestamp
  var userId = req.body.userId;
  var question = req.body;
  var m_date = new Date(); //Get current date time
  var m_miliseconds = m_date.getTime(); //make it to miliseconds
  var uid = userId + m_miliseconds; //Make uid with current + miliseconds
  question.questionId = uid;
  question.time = m_miliseconds;

  let query = db.ref('users/' + userId);
  query.once('value')
    .then(snapshot => {
      console.log(snapshot.val());
      question.interest = snapshot.val().gender;
      db.ref('question/' + uid).set(question)
        .then(question => {
          res.status(200).json({
            success: true,
            message: "Question added successfully",
            questionId: uid
          });
        }).catch((err) => { });
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });
})

router.post('/get_by_id/:uid', (req, res) => {  //Get question for specified question id
  var uid = req.params.uid; //questionId
  let query = db.ref('question/' + uid);
  query.once('value')
    .then(snapshot => {
      console.log(snapshot.val());
      return UTIL.responseHandler(res, true, "Get Question Success", snapshot.val());
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });
})

router.post('/get/mine', (req, res) => {  //Get questions for specified user
  var uid = req.body.userId; //User Id
  console.log(uid);
  let query = db.ref('question/');
  query = query.orderByChild('userId').equalTo(uid); //Get Questions that has same User ID
  var questionArray = [];
  query.once('value')
    .then(snapshot => {
      snapshot.forEach(function (childSnapshot) {
        questionArray.push(childSnapshot.val());
      });
      questionArray.sort(function (a, b) {
        var keyA =a.time,
          keyB = b.time;
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      return UTIL.responseHandler(res, true, "Get Questions Successfully ", questionArray);
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });
})

router.post('/get/others', (req, res) => {
  //Get my answers first
  var uid = req.body.userId; //User Id
  console.log(uid);

  let query = db.ref('users/' + uid);
  query.once('value')
    .then(snapshot => {
      var interest = snapshot.val().interest;
      console.log(interest);
      let query = db.ref('answer/');
      query = query.orderByChild('answeredUserId').equalTo(uid); //Get Questions that has same User ID
      var answerArray = [];
      query.once('value')
        .then(snapshot => {
          snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            answerArray.push(childData["questionId"]);
          });
          console.log(answerArray);
          //Then get questions without user id and without answered id
          let query = db.ref('question/');
          var questionArray = [];
          query.once('value') //Get All Questions
            .then(snapshot => {
              snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val();

                if ((childData["userId"] != uid) && (childData["interest"] == interest)) {
                  console.log(childData);
                  var isFlag = false;
                  for (var i = 0; i < answerArray.length; i++) {
                    if (childData["questionId"] == answerArray[i]) {
                      isFlag = true;
                    }
                  }
                  if (isFlag == false) {
                    questionArray.push(childSnapshot.val());
                  }
                  questionArray.sort(function (a, b) {
                    var keyA =a.time,
                      keyB = b.time;
                    // Compare the 2 dates
                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;
                    return 0;
                  });
                }
              });
              return UTIL.responseHandler(res, true, "Get Questions Successfully ", questionArray);
            })
            .catch(e => {
              return UTIL.responseHandler(res, false, "Cannot find Dataset your request", []);
            });
        })
        .catch(e => {
          return UTIL.responseHandler(res, false, "Cannot find Dataset your request", []);
        });
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", []);
    });
  //////////////////////
})

//Old API to get Questions
/*
router.post('/get/others', (req, res) => {
  //Get my answers first
  var uid = req.body.userId; //User Id
  console.log(uid);

  var interest = snapshot.val().interest;
  let query = db.ref('answer/');
  query = query.orderByChild('answeredUserId').equalTo(uid); //Get Questions that has same User ID
  var answerArray = [];
  query.once('value')
    .then(snapshot => {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        answerArray.push(childData["questionId"]);
      });
      //Then get questions without user id and without answered id
      let query = db.ref('question/');
      var questionArray = [];
      query.once('value') //Get All Questions
        .then(snapshot => {
          snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            
            if ((childData["userId"] != uid) && (childData["interest"]==interest)) {
              console.log(childData);
              var isFlag = false;
              for (var i = 0; i < answerArray.length; i++) {
                if (childData["questionId"] == answerArray[i]) {
                  isFlag = true;
                }
              }
              if (isFlag == false) {
                questionArray.push(childSnapshot.val());
              }
            }
          });
          return UTIL.responseHandler(res, true, "Get Questions Successfully ", questionArray);
        })
        .catch(e => {
          return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
        });
    })
    .catch(e => {
      return UTIL.responseHandler(res, false, "Cannot find Dataset your request", e);
    });
})
*/

router.post('/addqes', (req, res) => {
  var uid = req.body.userId;
  var question = req.body;
  var m_date = new Date(); //Get current date time
  var m_miliseconds = m_date.getTime(); //make it to miliseconds
  uid += m_miliseconds; //Make uid with current + miliseconds
  question.questionId = uid;
  // console.log(uid);

  db.ref('question/' + uid).once('value')
    .then(snapshot => {
      db.ref('question/' + uid).set(question)
        .then(question => {
          res.status(200).json({
            success: true,
            message: "Question added successfully",
            questionId: uid
          });
        }).catch((err) => { });
    })
    .catch(err => {
      UTIL.responseHandler(res, false, err.message);
    });
})


module.exports = router;