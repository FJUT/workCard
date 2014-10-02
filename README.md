#制作个性化工牌-一个js全栈小项目

@(blog)[javascript fullstack, work card, html5 upload]

![Alt text](http://king-images.qiniudn.com/word-card-cover.jpg)

功能很简单，本地选择图片上传，调整图片大小及位置，点击提交，图片合成在后端完成。

##安装

首先安装图片处理工具：[ImageMagick](http://www.imagemagick.org/)
可以在官网下载源码，然后安照官网上面的教程编译即可，在mac下的话，也可以使用brew安装：

    brew install imagemagick

然后安装npm包及bower包：

    npm install
    bower install

最后终端切换到项目根目录运行：

    grunt


##技术细节
用户主要针对公司内部员工，可以使用一些新技术简化开发流程，项目基于现代浏览器，可以不考虑古灰级玩家IE！

###UI界面
界面采用bootstrap，基于bootstrap的表单组件非常漂亮，使用也很方便。

###上传图片
传统做文件上传基本的方式是使用`Uploadify`这类的库，这类库往往封装好了浏览器兼容，在低版本IE使用flash来完成上传，并且提供了很好的事件接口给用户编写代码。但是基于我们的项目，使用这类库有已下几点不太理想：

1. 传统的方式是先把图片上传到服务器，返回图片路径，再显示给用户。上传图片及显示下载图片都会消耗时间及服务器资源。
2. 我们的大环境是现代浏览器，不需要一大堆兼容性代码

考虑到上述因素，我们使用html5的文件相关接口来简化这个过程：

    function checkSelImg() {
        var file = this.files[0];
        var type = file.type.split('/');
        var size = file.size;
        if (type[0] != 'image' || !allowImgType[type[1]]) {
            return  showError("图片格式不正确！(仅支持jpg/png)");
        }
        if (size > maxSize) {
            return  showError("图片大小不能超过5M！");
        }
        selFile.file = file;
        var url = window.URL.createObjectURL(file);
        readyCrop(url);
    }

简单的几行代码，图片无须上传到服务器，直接本地转化为URL呈现，不但加快了图片加载速度，还能在上传前由前端完成图片类型、文件大小等验证

###图片操作
图片放大缩小，调整坐标的交互比较复杂，这里选择jcrop，有兴趣想用原生js实现的朋友，可以参考cloudgamer大牛的[《JavaScript 图片切割效果》](http://www.cnblogs.com/cloudgamer/archive/2008/07/21/1247267.html)，不得不感概，大牛在08年就已经对js非常精通。

###输入同步
当用户在表单中输入自己的信息时，文字会立即同步显示在左边的预览区。这个功能是不是很熟悉，哈哈，angularjs的第一个demo就是这个。这时我脑海中出现这样一幅画面：angularjs说，这个功能我很擅长，让我来；原生js说，放开那表单，你太大了，让我来，我短小精悍！

确实在这个项目中实现同步很简单，只需要绑定`keyup`事件，然后把值同步过去就行了。但是如果想要更精准控制输入，比如只允许输入英文，要如何实现呢，这个专题相对独立，有兴趣的朋友看这篇文章[《javascript控制表单输入》](http://webfing.github.com/control-form-input)。[读者：你呀的，扯这么多，就为了给那篇文章做个广告。博主：亲，我做个内链容易吗我]


###图片合成
 这一步将会把员工信息、公司logo及上传的图片合并成一张图片。传统的做法是把图片的缩放比例及坐标信息发送给服务器，由服务器合成图片。这样的做法也是很蛋疼的，服务器的角色应该是数据库储，图片合成的计算是cpu密集型的，如果这样的工作能让浏览器前端来完全，岂不是可以大大减轻服务器的压力。

 #### 思考前端解决方案
 顺着上面的思路：由前端来完成图片合成功能。我想唯一有可能完成这项任务也只有canvas了，啪啪，在股沟搜一把，果然有成熟的解决方案[html2canvas](http://html2canvas.hertzen.com/)，灰常犀利，还可以任意指定想截图的dom。大致的原理应该是把指定的dom在canvas中同样实现一遍，然后由canvas转成图片。

 码农辛勤劳作搜索猎物，终于得到了弥足珍贵食材！哎哟，我勒去，差一点火喉！

 ![Alt text](http://king-images.qiniudn.com/canvas.jpg)

工牌最终是要打印出来的，所以合成图必须按照打印级的标准来合成，最重要一点就是DPI不能小于300，咱上面的合成图是按显示器的标准72输出的，差太远了。查了查html2canvas的插件，没有设置DPI的接口，悲剧了，然后又查了canvas生原的实现，也没有找到设置DPI的接口。
####后端实现
看来只能按传统的方式走，由后端合成图片，node.js有哪些好用的图型库呢，我的搜索过程是这样的：

    nodejs 图形处理库 -> node gm -> GraphicsMagick

通过搜索node图形处理库，我查到了node gm 这个包，然后知道他的底层是调用GraphicsMagick这个工具的接口实现的。

有点遗憾的是[gm](http://aheckmann.github.io/gm/)官方给出例子不涉及到图片合成，查阅文档，接口虽然很多，却没有对应demo，也没有找到合成图片的接口。

继续搜索，得知原来GraphicsMagick是一个命令行工具，gm包底层也是调命令行来实现的，不过gm包只封装了GraphicsMagick的convert接口，而合成图片的composite接口没有封装。

这下清楚了，gm包没有封装，只能用子进程(child_process)来调GraphicsMagick接口。

在摸索用子进程调GraphicsMagic命令行接口的过程中遇到很多问题，分享一下：
* 除了GraphicsMagick还有一个imagemagick工具，GraphicsMagick是基于imagemagick的，两者接口参数上有些不同，代码不能通用，最终我选择了imagemagick，第一imagemagick的中文资料多一些，第二imagemagick的高版本解决了中文乱码的问题

* 使用node的child_process模块调用系统命令行时要明确自己在使用哪个系统，比如有如下代码：

        //child.js
        var spawn = require('child_process').spawn;
        var ls = spawn('ls', ['-la']);

        ls.on('error', function (err) {
            console.log('ls error', err);
        });

        ls.on('close', function (code) {
            console.log('ls process exited with code ' + code);
        });

开发环境是win7，如果使用git bash命令行执行`node child.js`，结果是正常输出的。但是如果使用cmd命令行同样执行`node child.js`会报错。

* 路径
 在执行node程序时，代码中的相对路径是相对于当前文件的

 假设文件结构如下，项目入口文件为`app.js`

    - app.js
    + routes
     - child.js
    + public
     + img
      - logo.png

 在child.js中想引用logo.png，那么路径是：

        ../public/img/logo.png

  但是在child_process调用系统命令中，这个相对的路径是指向入口文件（这里即为app.js）

        public/img/logo.png

 明确这点非常重要，不然在合成图片命令中，指定的图片路径很容易出错


##效果图
 最后来看终效果图

![Alt text](http://king-images.qiniudn.com/mm-meimei.jpg)



##相关文章
javascript控制表单输入: [http://webfing.github.com/control-form-input](http://webfing.github.com/control-form-input)