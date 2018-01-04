const UTIL = require('../global/util.js');

var express = require('express');
var router = express.Router();
var db = require('firebase').database();

router.post('/add', (req, res) => {
  var uid = req.body.answerId;   //Anwer ID
  var nRate = req.body.rate;     //Rate Value
  var strRate = {                //Make Json data to save
    rate:nRate                   //Number of Rate
  } 
  db.ref('answer/' + uid).once('value') 
    .then(snapshot => {
      db.ref('answer/' + uid).update(strRate)
        .then(rate => {
          UTIL.responseHandler(res, true, "Answer Successfully Rated!");
        }).catch((err) => {});
    })
    .catch(err => {
      UTIL.responseHandler(res, false, err.message);
    });
})

module.exports = router;