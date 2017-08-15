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

/* GET users listing.
router.get('/', function(req, res, next) {
    res.redirect('/board/list');
});
*/

router.get('/list', function(req,res,next){

  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }

  var sess_name = req.session.name;


    pool.getConnection(function (err, connection) {
        // Use the connection
        var sql = "SELECT ADMIN_ID"
		        +",ADMIN_NM"
		        +",MOBILE_NO"
		        +",EMAIL"
		        +",USE_YN"
		        +",TEL_NO"
		        +",CRE_DT"
		        +",CRE_ID"
		        +",MOD_DT"
		        +",MOD_ID"
		+" FROM MEMBER_TB"
		+" WHERE DEL_YN='N'"
		+" ORDER BY CRE_DT DESC, ADMIN_ID";
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('adminList', {title: '운영자 관리', selectItem:'all',
            keyword:'', sess_name:sess_name, rows: rows});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

router.get('/adminForm', function(req,res,next){
  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }

    res.render('adminForm', {mode:'insert'});
});

router.post('/idCheck', function(req,res,next){

    var memberID = req.body.ADMIN_ID;
    console.log(req.body.ADMIN_ID);
    var datas = [memberID];

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var sql = "SELECT COUNT(*) AS count FROM MEMBER_TB WHERE ADMIN_ID=?";
        connection.query(sql,datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            //res.redirect('/board');

            if(rows[0].count > 0){
                res.send({resultCode:100});
            } else {
              res.send({resultCode:1});
            }

            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});

router.post('/insertMember', function(req,res,next){
  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }
  
    var memberID = req.body.ADMIN_ID;
    var memberPWD = req.body.ADMIN_PWD;
    var memberNM = req.body.ADMIN_NM;
    var orgNM = req.body.ORG_NM;
    var telNo = req.body.TEL_NO;
    var mobileNo = req.body.MOBILE_NO;
    var email = req.body.EMAIL;

    var datas = [memberID, memberPWD, memberNM, telNo, mobileNo, email, orgNM];

    console.log(datas);

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var sql = "INSERT INTO MEMBER_TB"
		+" VALUES(?,?,?,?,?,?,?, 'N', 'N', '', '', 0, now(), '', now(), '', 'N')";
        connection.query(sql,datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.send({resultCode:1, redirectUrl:'/board/list'});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});

router.get('/update', function(req,res,next){
  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }

  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }
//    var adminId = req.body.checkArray;
    var adminId = req.query.id;

    var datas = [adminId];

    console.log("datas : "+datas);

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var sql= "SELECT ADMIN_ID, ADMIN_NM, TEL_NO, MOBILE_NO, ORG_NM, EMAIL FROM MEMBER_TB WHERE ADMIN_ID=?";
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('adminForm', {resultCode:1, mode:'update', rows: rows});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});



router.post('/updateMember', function(req,res,next){
  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }

  var memberID = req.body.ADMIN_ID;
  var memberPWD = req.body.ADMIN_PWD;
  var memberNM = req.body.ADMIN_NM;
  var orgNM = req.body.ORG_NM;
  var telNo = req.body.TEL_NO;
  var mobileNo = req.body.MOBILE_NO;
  var email = req.body.EMAIL;

  var datas;
  var sql = "";

  if(memberPWD==''){
      datas = [memberNM, telNo, mobileNo, email, orgNM, memberID];

      sql= "UPDATE MEMBER_TB SET ADMIN_NM=?, TEL_NO=?, MOBILE_NO=?, EMAIL=?, ORG_NM=?"
        +" WHERE ADMIN_ID=?";
  } else {
      datas = [memberPWD, memberNM, telNo, mobileNo, email, orgNM, memberID];

      sql= "UPDATE MEMBER_TB SET ADMIN_PWD=?, ADMIN_NM=?, TEL_NO=?, MOBILE_NO=?, EMAIL=?, ORG_NM=?"
        +" WHERE ADMIN_ID=?";
  }

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            //console.log("rows : " + JSON.stringify(rows));

            res.send({resultCode:1, redirectUrl:'/board/list'});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });


});

router.post('/delete', function(req,res,next){

  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }

    var memberIDArray = req.body.checkArray.split(',');

    var datas = [];
    var param = "";


    param +="(";
    for(var idx in memberIDArray){
      datas.push(memberIDArray[idx]);
      param +="?,";
    }
    param = param.slice(0,-1);
    param +=")";

    //ar datas = [req.body.checkArray];

    console.log(datas);

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var sql= "UPDATE MEMBER_TB SET DEL_YN='Y'"
		      +" WHERE ADMIN_ID IN "+param;
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            //console.log("rows : " + JSON.stringify(rows));

            res.send({resultCode:1});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });


});

router.get('/select', function(req,res,next){

  var sess = req.session.user_id;

  if(sess == undefined){
    res.redirect('/users/login')
  }

  var sess_name = req.session.name;

  var selectItem = req.query.selectitem;
  var keyword = req.query.keyword;

  var addSql;

  var datas = [keyword];

  if(selectItem == 'id'){
    addSql = "ADMIN_ID=?";
  } else if(selectItem == 'name') {
    addSql = "ADMIN_NM=?";
  } else {
    addSql = "(ADMIN_ID=? OR ADMIN_NM=?)";

    datas.push(keyword);
  }

    pool.getConnection(function (err, connection) {
        // Use the connection
        var sql = "SELECT ADMIN_ID"
		        +",ADMIN_NM"
		        +",MOBILE_NO"
		        +",EMAIL"
		        +",USE_YN"
		        +",TEL_NO"
		        +",CRE_DT"
		        +",CRE_ID"
		        +",MOD_DT"
		        +",MOD_ID"
		+" FROM MEMBER_TB"
		+" WHERE DEL_YN='N' AND "+addSql
		+" ORDER BY CRE_DT DESC, ADMIN_ID";
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('adminList', {title: '운영자 관리', selectItem:selectItem,
              keyword:keyword, sess_name:sess_name, rows: rows});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});


module.exports = router;
