// const UTIL = require('../global/util.js');
// var express = require('express');
// var router = express.Router();

// router.get('/login/:id', (req, res) => {
//   var uid = req.params.id;
//   if (!uid) return UTIL.responseHandler(res, false, "uid is not set !", "user id is required.");

//   console.log("account get req: ", req.body);

//   admin.database().ref('users/' + uid).once('value')
//     .then(snapshot => {
//       var user = snapshot.val();
//       return UTIL.responseHandler(res, true, "success", user);
//     })
//     .catch(e => {
//       return UTIL.responseHandler(res, false, "Cannot find User by uid:" + uid, e);
//     });
// });

// router.post('/update/:id', (req, res) => {
//   var uid = req.params.id;
//   if (!uid) return UTIL.responseHandler(res, false, "uid is not set !", "onwer id is required.");

//   console.log("account update req: ", req.body);
//   var first_name = req.body.first_name ? req.body.first_name : "";
//   var last_name = req.body.last_name ? req.body.last_name : "";
//   var email = req.body.email ? req.body.email : "";
//   var password = req.body.password ? req.body.password : "";
//   var nick_name = req.body.nick_name ? req.body.nick_name : "";
//   var interest = req.body.interest ? req.body.interest : "";
//   var gender = req.body.gender ? parseInt(req.body.gender) : 0;

//   admin.database().ref('users/' + uid).once('value')
//     .then(snapshot => {
//       return admin.database().ref('users/' + uid).set({
//         first_name: first_name,
//         last_name: last_name,
//         email: email,
//         password: password,
//         nick_name: nick_name,
//         interest: interest,
//         gender: gender
//       });
//     })
//     .then(snapshot => {
//       UTIL.responseHandler(res, true, "successfully registered");
//     })
//     .catch(e => {
//       return UTIL.responseHandler(res, false, "Error while your request:" + uid, e);
//     });
// });

// module.exports = router;