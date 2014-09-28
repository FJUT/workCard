var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var gm = require('gm');
var spawn = require('child_process').spawn;
var imgFolder = '../public/upload/';


function combineImg(src, filename, cb){
    src="C:\\Users\\user\\AppData\\Local\\Temp\\7956-tdh8jm.jpg";
    filename = 'dest.jpg';
    var crop = spawn('convert', [
        '-density',
        '300x300', //定义DPI
        '-resize',
        '680x1032', //放大后尺寸
        '-crop',
        '548x870+124+0', //截图坐标
        '-quality',
        '100', //定义输出质量
        '+profile',
        '*', //去除EXT信息
        src,
        imgFolder+filename
    ]);

    crop.on('exit',function(code) {
        if (code != 0) {
            console.log('gm crop process exited with code ' + code);
        } else {
            console.log('ok');
            var imgSrc = '/upload/'+filename;
            if (cb) cb(imgSrc);
        }
    });
}


function combineImg2(){

    var composite = spawn('gm',
        [
            'composite',
            '-gravity',
            'SouthEast', //右下角
            '-dissolve',
            '80', //溶解度,和透明度类似
            '/source/logo.png',
            '/source/mm.jpg',
            '/source/dest.jpg'
        ]);

    composite.stdout.on('data',function(data){
        console.log(data);
    });

    composite.stderr.on('data',function(data){
        console.log(data);
    });

    composite.on('exit',function(code){
        if(code != 0){
            console.log('gm composite process exited with code ' + code);
        }
    });
}

combineImg();