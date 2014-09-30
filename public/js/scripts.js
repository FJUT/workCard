$(function () {
    var workbench = $("#workbench");
    var camera = workbench.find('.camera');
    var loading = workbench.find('.loading');
    var errorPanel = workbench.find('.errorPanel');
    var tools = workbench.find('.tool');
    var reloadBtn = workbench.find('a.reUpload');

    var selFile = {};      //所选文件信息

    //截图操作区域信息
    var holderPane = workbench.find('.imgArea');
    var holderWidth =  holderPane.width();
    var holderHeight =  holderPane.height();
    var holderRatio = holderWidth/holderHeight;

    //预览视窗信息
    var previewPane = $("#preview-pane");      //预览面板
    var previewImg = previewPane.find('img');
    var previewWidth = previewPane.width();
    var previewHeight = previewPane.height();
    var previewRatio = previewWidth / previewHeight; //预览面板长宽比例

    //表单元素
    var reUploadMain = workbench.find("a.reUpload.main");
    var workForm = $('#workForm');
    var saveBtn = $("#saveBtn");
    var jcrop_api;
    var mask = $("#mask");
    var progressWrap = $("#progressWrap");
    var progressStatusHolder = $("#progressMsg");
    var progressBar = progressWrap.find(".progress-bar");
    var combineImg = $("#combinImg");
    var uploadIpt = $("#uploadIpt");

    //图片参数信息
    var allowImgType = {
        jpeg: 'allow',
        jpg: 'allow',
        png: 'allow'
    };
    var maxSize = 5 * 1024 * 1024;
    var combineRatio = 2;   //真实合成图与预览面板大小比例

    function getHolderImg(){
        return holderPane.children('img');
    }

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

    function readyCrop(url) {
        var img = new Image();
        var holderImg = getHolderImg();
        img.onload = function () {
            selFile.width = img.width;
            selFile.height = img.height;
            if (img.width / img.height > holderRatio) {
                holderImg.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                holderImg.css({
                    height: '100%',
                    width: 'auto'
                });
            }
            holderImg[0].src = url;
            previewImg[0].src = url;
            selFile.url = url;
            showImg();
            if (jcrop_api) {
                jcrop_api.destroy();
                jcrop_api = null;
            }
            setTimeout(function(){
                initJcrop();
                checkSubmit();
            },0);
        };
        img.onerror = function () {
            showError();
        }
        img.src = url;
    }

    function initJcrop() {

        var boundx, boundy;

        $('#target').Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: previewRatio
        }, function () {
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            jcrop_api = this;
            holderToCenter();
            jcrop_api.animateTo([50, 50, 200, 200]);
        });

        function updatePreview(c) {
            if (parseInt(c.w) > 0) {
                var rx = previewWidth / c.w;
                var ry = previewHeight / c.h;

                previewImg.css({
                    width: Math.round(rx * boundx) + 'px',
                    height: Math.round(ry * boundy) + 'px',
                    marginLeft: '-' + Math.round(rx * c.x) + 'px',
                    marginTop: '-' + Math.round(ry * c.y) + 'px'
                });
            }
        }
    }

    function holderToCenter(){
        var jcropHolder = $(".jcrop-holder");
        var jcropHolderWidth = jcropHolder.width();
        var jcropHolderHeight = jcropHolder.height();
        if (jcropHolderWidth<holderWidth){
            jcropHolder.css({
                'left': (holderWidth- jcropHolderWidth)/2
            });
        }
        if (jcropHolderHeight<holderHeight){
            jcropHolder.css({
                'top': (holderHeight- jcropHolderHeight)/2
            });
        }
    }

    function showProgress(msg, percent, cb) {
        mask.show();
        progressWrap.show();
        progressStatusHolder.text(msg);
        progressBar.css('width', percent);
        if (cb) {
            cb();
        }
    }

    function showUpload() {
        tools.hide();
        camera.show();
        uploadIpt[0].value = '';
        reUploadMain.stop().animate({
                right: '35px'
            },0);
    }

    function showImg() {
        tools.hide();
        holderPane.show();
        reUploadMain.stop().animate({
                right: '-35px'
            },
            300);
    }

    function showError(msg) {
        msg = msg || '上传失败';
        tools.hide();
        errorPanel.find('.loadingText>b').text(msg);
        errorPanel.show();
    }

    function checkSubmit() {
        if (!jcrop_api) {
            return false;
        }
        var hasChecked = true;
        workForm.find('input[type=text]').each(function () {
            if ($(this).val().trim().length == 0) {
                hasChecked = false;
            }
        });
        if (hasChecked) {
            saveBtn.attr('disabled', false);
        } else {
            saveBtn.attr('disabled', true);
        }
    }

    function submitForm(e) {
        e.preventDefault();
        var file = selFile.file;
        var offsetLeft = Math.abs(parseInt(previewImg.css('margin-left'))) * combineRatio;
        var offsetTop = Math.abs(parseInt(previewImg.css('margin-top'))) * combineRatio;

        //submit to server
        var formData = new FormData();
        formData.append('zhname', $("#inputZhName").val());
        formData.append('enname', $("#inputEnName").val());
        formData.append('department', $("#inputDepartment").val());
        formData.append('imgSize', previewImg.width() * combineRatio + 'x' + previewImg.height() * combineRatio);
        formData.append('imgCrop', previewWidth * combineRatio + 'x' + previewHeight * combineRatio + '+' + offsetLeft + '+' + offsetTop);
        formData.append(file.name, file);

        var postServerXhr = new XMLHttpRequest();
        postServerXhr.open('POST', '/api/upload', true);
        postServerXhr.onload = function () {

            var url = JSON.parse(this.response).data;

            showProgress('正在合生图片', '60%');
            var combineImgObj = new Image();
            combineImgObj.onload = function () {
                showProgress('工牌制作完成', '100%');
                setTimeout(function () {
                    showCombinImg(url);
                }, 500);
            };
            combineImgObj.src = url;
        };

        postServerXhr.send(formData);

        showProgress('正在合生工作牌', '70%');

    }

    function showCombinImg(url) {
        url = url+'?'+new Date().getTime();
        progressWrap.hide();
        combineImg.children('img')[0].src = url;
        combineImg.show();
        combineImg.find('.viewImg').attr('href', url);
    }

    function completeMake() {
        combineImg.hide();
        mask.hide();
    }

    function reMark() {
        combineImg.hide();
        mask.hide();
        showUpload();
    }

    uploadIpt.bind('change', checkSelImg);

    combineImg.find('.complete').bind('click', completeMake);

    combineImg.find('.redo').bind('click', reMark);

    saveBtn.bind('click', submitForm);

    reloadBtn.bind('click', showUpload);

    workForm.find('input[type=text]').each(function () {
        var root = $(this);
        var target = $(this).attr('data-target');
        root.keydown(function(e){

            //控制只能输入英文，不能输入标点,在按下时就控制(没法控制中文)
            //if (e.keyCode==110){
            //    console.log('.');
            //    return false;
            //}

            //等待输入法完成
            setTimeout(function () {
                //控制不能输入中文
                //var val = root[0].value;
                //root[0].value= val.replace(/[^a-zA-Z]/g,'');

                //值为空时，回到占位符
                if (root.val().length == 0) {
                    $('#' + target).text(root.attr('placeholder'));
                } else {
                    //响应求值
                    $('#' + target).text(root.val());
                }

                checkSubmit();

            },50);


        });

    });

    workForm.find('select').change(function () {
        var root = $(this);
        var target = $('#' + $(this).attr('data-target'));
        var colorCls = $(this).find("option:selected").attr('data-color');
        target[0].className = '';
        target.text(root.val()).addClass(colorCls);
    })

});