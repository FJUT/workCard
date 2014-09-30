var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var spawn = require('child_process').spawn;
var logoImg = 'routes/source/logo.png';
var imgFolder = 'public/upload/';


/*
* 合成图片
* */
function combineImg(src, filename, combineMeta,  cb){

    var dest = imgFolder+filename;
    //第一步：按大小截图
    var crop = spawn('convert', [
        '-density',
        '300x300', //定义DPI
        '-resize',
        combineMeta.size, //放大后尺寸
        '-crop',
        combineMeta.crop, //截图坐标
        '-quality',
        '100', //定义输出质量
        '+profile',
        '*', //去除EXT信息
        src,
        dest
    ]);

    crop.on('error', function (err) {
        console.log('gm crop error', err);
    });

    crop.on('exit',function(code) {
        if (code != 0) {
            console.log('gm crop process exited with code ' + code);
        } else {

            //第二步：添加文字信息
            var addText = spawn('convert',
                [
                    '-font',
                    'NexaLight', //定义字体
                    '-fill',
                    'rgba(0,0,0,0.75)', //定义画笔颜色
                    '-draw',
                    'Rectangle 0,770 548,870', //画背景色块
                    '-fill',
                    'white', //重新定义画笔颜色
                    '-pointsize',
                    '32', //定义字体大小
                    '-draw',
                    "text 80,810 '"+combineMeta.enname+"'", //写英文名
                    //"text 80,810 'king'", //写英文名
                    '-font',
                    'routes/source/AdobeHeitiStd-Regular.otf', //定义字体
                    '-draw',
                    "text 80,855 '"+combineMeta.zhname+"'" , //写中文名
                    //"text 80,855 'cpjmj'" , //写中文名
                    '-fill',
                    'rgb(80,150,240)', //重新定义画笔颜色
                    '-pointsize',
                    '36', //定义字体大小
                    '-draw',
                    "text 330,840 '"+combineMeta.department+"'" , //写部门
                    //"text 330,840 'TK'" , //写部门
                    '-draw',
                    'Rectangle 310,810 320,840', //画色块
                    '-quality',
                    '100', //定义输出质量
                    dest,
                    dest
                ]);

            addText.on('exit',function(code){
                if(code != 0){
                    console.log('gm addText process exited with code ' + code);
                }else{

                    //第三步：将图层合并
                    var composite = spawn('composite',
                        [
                            logoImg,
                            dest,
                            '-gravity',
                            'northwest', //重叠坐标
                            dest
                        ]);

                    composite.on('exit',function(code){
                        if(code != 0){
                            console.log('gm composite process exited with code ' + code);
                        }else{
                            var imgSrc = '/upload/'+filename;
                            if (cb) cb(imgSrc);
                        }
                    });
                }
            });


        }
    });
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/**
 * 上传请求
 */
router.post('/api/upload', multipartMiddleware, function(req, res, next) {
    var resMsg = {
        stauts: "ok",
        msg: "上传成功",
        data: ""
    };
    var zhname = req.body.zhname;
    var enname = req.body.enname;
    var department = req.body.department;
    var imgSize = req.body.imgSize;
    var imgCrop = req.body.imgCrop;
    var files = req.files;
    var combineMeta = {
        zhname: zhname,
        enname: enname,
        department: department,
        size: imgSize,
        crop: imgCrop
    };

    if (!zhname || !enname || !department || !files || !imgSize || !imgCrop){
        resMsg.stauts = "error";
        resMsg.msg = "上传信息不全！";
        return res.json(resMsg);
    }

    for(var filename in files){
        var file = files[filename]
        return combineImg(file.path, enname+'-'+zhname+'.jpg', combineMeta, function(src){
            resMsg.data = src;
            return res.json(resMsg);
        })
    }

});

module.exports = router;