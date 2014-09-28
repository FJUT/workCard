var express = require('express');
var router = express.Router();
var qiniu = require("qiniu");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/*
七牛上传配置
 */

// 配置密钥
qiniu.conf.ACCESS_KEY = '';
qiniu.conf.SECRET_KEY = '';

//获得上传token
var policy = new qiniu.rs.PutPolicy("qifunoa");
policy.deadline = 1451491200;
policy.fsizeLimit = 1000*1000*5;
//policy.saveKey = "testtesttest.doc";
var allowType = [
    "image/jpeg"                   //jpg
    ,"image/png"                    //png
];
policy.mimeLimit = allowType.join(";");

var uptoken = policy.token();

/**
 * 获取 upload token
 */
router.get('/api/uptoken', function(req, res, next) {
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (uptoken) {
        res.json({
            uptoken: uptoken
        });
    }
});


/**
 * save or edit pic
 */
router.post('/api/upload', function(req, res, next) {
    
});


module.exports = router;
