var fs = require('fs');
var gm = require('gm');
var teacher = 'mm.jpg';
var logo = 'logo.png';
var dest = "dest.jpg";

var spawn = require('child_process').spawn;

var crop = spawn('convert',
  [
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
      teacher,
      dest
  ]);

crop.on('exit',function(code){
  if(code != 0){
      console.log('gm crop process exited with code ' + code);
  }else{

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
            "text 80,810 'King'", //写文字
            '-font',
            'AdobeHeitiStd-Regular.otf', //定义字体
            '-draw',
            "text 80,855 'cpjmj'" , //写文字
            '-fill',
            'rgb(80,150,240)', //重新定义画笔颜色
            '-pointsize',
            '36', //定义字体大小
            '-draw',
            "text 330,840 '陈培君'" , //写文字
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
            var composite = spawn('composite',
              [
                  logo,
                  dest,
                  '-gravity',
                  'northwest', //重叠坐标
                  dest
              ]);

            composite.on('exit',function(code){
              if(code != 0){
                  console.log('gm composite process exited with code ' + code);
              }else{
                console.log('ok');
              }
            });
        }
      });
  }
});



