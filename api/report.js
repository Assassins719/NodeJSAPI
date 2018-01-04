const UTIL = require('../global/util.js');

var express = require('express');
var router = express.Router();
var db = require('firebase').database();

router.post('/add', (req, res) => {
  var uid = req.body.answerId;  //Anwer ID
  var report = req.body.reportReason;    //Rate Value
  var strReport = {               //Make Json data to save
    report: report
  }
  db.ref('answer/' + uid).once('value')
    .then(snapshot => {
      if (snapshot.val() != null) {
        db.ref('answer/' + uid).update(strReport)
          .then(rate => {
            UTIL.responseHandler(res, true, "Successfully Reported!");
          }).catch((err) => { 
            UTIL.responseHandler(res, false, "Failed Reporting!");
          });
      }
      else{
        UTIL.responseHandler(res, false, "No Answer Exist!");
      }
    })
    .catch(err => {
      UTIL.responseHandler(res, false, err.message);
    });
})


// router.post('/add', (req, res) => {
//   var uid = req.body.answerId; //Anwser ID
//   console.log(uid);
//   var strReport = req.body.reportReason; //Report String
//   var jsonReport = { //Make Json data to save
//     report: strReport
//   }
//   console.log(jsonReport);
//   db.ref('answer/' + uid).once('value')
//     .then(snapshot => {
//       db.ref('answer/' + uid).update(jsonReport)
//         .then(report => {
//           UTIL.responseHandler(res, true, "Successfully Reported!");
//         }).catch((err) => { });
//     })
//     .catch(err => {
//       UTIL.responseHandler(res, false, err.message);
//     });

// db.ref('answer/' + uid).update(strRate)   //Save made json data to answer/answerId
//   .then(rate => {     //Success
//     UTIL.responseHandler(res, true, "Successfully Rated!");
//   }).catch((err) => { //Fail
//     UTIL.responseHandler(res, false, err.message);
//   });

// db.ref('question/' + uid).once('value')
//   .then(snapshot => {
//     db.ref('question/' + uid).set(question)
//       .then(question => {
//         res.status(200).json({
//           success: true,
//           message: "Question added successfully",
//           questionId: uid
//         });
//       }).catch((err) => { });
//   })
//   .catch(err => {
//     UTIL.responseHandler(res, false, err.message);
//   });
// })

// router.post('/get/mine', (req, res) => {
//   var uid = req.body.userId; //User Id
//   console.log(uid);
//   let query = db.ref('question/');
//   query = query.orderByChild('userId').equalTo(uid); //Get Questions that has same User ID

//   var questionArray = [];

//   query.once('value')
//     .then(snapshot => {
//       snapshot.forEach(function (childSnapshot) {
//         questionArray.push(childSnapshot.val());
//       });
//       return UTIL.responseHandler(res, true, "Get Questions Successfully ", questionArray);
//     })
//     .catch(e => {
//       return UTIL.responseHandler(res, false, "Cannot find Dataset your request: " + firstOwnerId, e);
//     });
// })

module.exports = router;