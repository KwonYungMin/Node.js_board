var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var sess = req.session.user_id;

  if(sess != undefined){
    console.log('/board/list');
      res.redirect('/board/list');
  } else {
    res.redirect('users/login')
  }
});

module.exports = router;
