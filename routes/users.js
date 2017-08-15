var express = require('express');
var router = express.Router();

//   MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    database: 'study',
    password: '7614'
});

/* GET users listing. */
router.get('/login', function(req, res, next) {
    var sess = req.session.user_id;

    if(sess != undefined){
        res.redirect('/board/list');
    } else {
      res.render('login')
    }

});

router.post('/login', function(req,res,next){
    var id = req.body.userId;
    var pwd = req.body.password;
    var datas = [id, pwd];

    console.log(datas);

    pool.getConnection(function (err, connection) {
        // Use the connection
        var sql = "SELECT COUNT(*) AS count, ADMIN_NM FROM MEMBER_TB"
        +" WHERE ADMIN_ID=? AND ADMIN_PWD=? AND ADMIN_YN = 'Y'";
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));
            var count = rows[0].count;
            var name = rows[0].ADMIN_NM;

            console.log("count : "+count);
            if(count == 1){
              req.session.user_id = id;
              req.session.name = name;
              res.send({resultCode:1, redirectUrl:'/board/list'});
            } else {
              res.send({resultCode:100});
            }

            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

router.get('/logout', function(req,res,next){
  req.session.destroy(function(err){
    if(err) console.err('err', err);
      res.redirect('/users/login');
  });
});

module.exports = router;
