var express = require('express');
var router = express.Router();
var Util = require('../global/util.js');
var db = require('firebase').database();

// router.get('/check-email/:email', (req, res) => {
//     db.ref('User').orderByChild('email').equalTo(req.params.email).once('value', (snapshot) => {
//         if (snapshot.val() != null) 
//             Util.responseHandler(res, false);
//         else
//             Util.responseHandler(res, true);
//     });
// })

// =======User Login=======
router.get('/login/:uid', (req, res) => {
    console.log(req.params.uid);        //User uuid when get from firebase login
    var profile = null;
    db.ref('users/' + req.params.uid).once('value') //Get user profile data with user uid
        .then(snapshot => {
            console.log(snapshot.val());
            if (snapshot.val() == null)     //if user profile data == null
                Util.responseHandler(res, false, 'The user with such uid doesn\'t exists', null);
            else {
                profile = snapshot.val();   //if user profile exist, return it
                Util.responseHandler(res, true, "Login Success!", profile);
                // db.ref('question/').once('value')
                //     .then(questions => {
                //         var data = {
                //             profile: profile,
                //             questions: questions
                //         }
                //         Util.responseHandler(res, true, "Login Success!", data);
                //     })
                //     .catch(err => {
                //         Util.responseHandler(res, false, err.message);
                //     });
            }
        })
})

// =======Create or Update user profile=========
router.post('/update/:uid', (req, res) => {
    var uid = req.params.uid;   //User uuid
    var profile = req.body;     //User profile data
    // console.log(uid);
    // console.log(account);
    // db.ref('users/' + uid).once('value')
    // .then(snapshot => {

    db.ref('users/' + uid).set(profile)
        .then(profile => {
            Util.responseHandler(res, true);
        })
        .catch(err => {
            Util.responseHandler(res, false, err.message);
        });
    // })
    // .catch(err => {
    //     Util.responseHandler(res, false, err.message);
    // });
})

router.post('/updateaccount/:uid', (req, res) => {
    var uid = req.params.uid;
    if (!uid) return UTIL.responseHandler(res, false, "uid is not set !", "onwer id is required.");

    console.log("account update req: ", req.body);
    var first_name = req.body.first_name ? req.body.first_name : "";
    var last_name = req.body.last_name ? req.body.last_name : "";
    var email = req.body.email ? req.body.email : "";
    var password = req.body.password ? req.body.password : "";
    var nick_name = req.body.nick_name ? req.body.nick_name : "";
    var interest = req.body.interest ? req.body.interest : "";
    var gender = req.body.gender ? parseInt(req.body.gender) : 0;

    admin.database().ref('users/' + uid).once('value')
        .then(snapshot => {
            return admin.database().ref('users/' + uid).set({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                nick_name: nick_name,
                interest: interest,
                gender: gender
            });
        })
        .then(snapshot => {
            UTIL.responseHandler(res, true, "successfully registered");
        })
        .catch(e => {
            return UTIL.responseHandler(res, false, "Error while your request:" + uid, e);
        });
});


router.get('/loginaccount/:id', (req, res) => {
    var uid = req.params.id;
    if (!uid) return UTIL.responseHandler(res, false, "uid is not set !", "user id is required.");

    console.log("account get req: ", req.body);

    admin.database().ref('users/' + uid).once('value')
        .then(snapshot => {
            var user = snapshot.val();
            UTIL.responseHandler(res, true, "success", user);
        })
        .catch(e => {
            return UTIL.responseHandler(res, false, "Cannot find User by uid:" + uid, e);
        });
});

module.exports = router;