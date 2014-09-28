$(function(){
    var workbench = $("#workbench");
    var camera = workbench.find('.camera');
    var imgArea = workbench.find('.imgArea');
    var loading = workbench.find('.loading');
    var errorPanel = workbench.find('.errorPanel');
    var tools = workbench.find('.tool');
    var reloadBtn = workbench.find('a.reUpload');
    var imgAreaRatio = imgArea.width()/imgArea.height();
    var previewPane = $("#preview-pane");
    var reUploadMain = workbench.find("a.reUpload.main");
    var workForm = $('#workForm');
    var saveBtn = $("#saveBtn");
    var jcrop_api;
    var minTargetWidth = previewPane.width();
    var minTargetHeight = previewPane.height();
    var originWidth, originHeight;
    var originImgUrl;
    var canvasWrap = $('#workCard .wrap');
    var mask = $("#mask");
    var progressWrap = $("#progressWrap");
    var progressStatusHolder = $("#progressMsg");
    var progressBar = progressWrap.find(".progress-bar");
    var combinImg = $("#combinImg");

    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: 'upload',
        container: 'uploadBox',
        drop_element: 'uploadBox',
        max_file_size: '5mb',
        flash_swf_url: '../../components/plupload/js/Moxie.swf',
        dragdrop: true,
        multi_selection: false,
        //unique_names: true,
        //save_key: true,
        chunk_size: '4mb',
        uptoken_url: '/api/uptoken',
        domain: 'http://qifunoa.qiniudn.com/',
        auto_start: true,
        init: {
            'FilesAdded': function(up, files) {
                showLoading();
            },
            'BeforeUpload': function(up, file) {
            },
            'UploadProgress': function(up, file) {
            },
            'UploadComplete': function() {
            },
            'FileUploaded': function(up, file, info) {
                var domain = up.getOption('domain');
                var res = $.parseJSON(info);
                var sourceLink = domain + res.key;
                //sourceLink = sourceLink+"?imageView2/1/w/280/h/140";
                loadImg(sourceLink);
            },
            'Error': function(up, err, errTip) {
                console.log(errTip);
                if (err.status==403){
                    return showError("文件类型不符合！");
                }
                if (errTip){
                    showError(errTip);
                }
            },
            'Key': function(up, file) {
                var fileName = file.name;
                var size = file.size;
                var newName = fileName.replace(/\.([a-zA-Z]+)$/gi, function($$){
                    return '_'+file.size+$$;
                });
                return newName;
                //return '';
            }
        }
    });

    function loadImg(url){
        showLoading();
        var imgHolder = imgArea.find("img")[0];
        var bigImgHolder = previewPane.find('img')[0];
        var img = new Image();
        img.onload = function(){
            originWidth = img.width;
            originHeight = img.height;
            if(img.width/img.height>imgAreaRatio){
                $(imgHolder).css({
                    width: '100%',
                    height: 'auto'
                });
            }else{
                $(imgHolder).css({
                    height: '100%',
                    width: 'auto'
                });
            }
            imgHolder.src = url;
            bigImgHolder.src = url;
            originImgUrl = url;
            showImg();
            if (jcrop_api){
                jcrop_api.destroy();
                jcrop_api = null;
            }
            initJcrop();
            checkSubmt();
        };
        img.onerror = function(){
            showError();
        }
        img.src = url;
    }

    function remove(url){
        thumbUpload.children('li').hide();
        addWrap.show();
        $scope.post.thumb = thumbDefault;
    }

    function showProgress(msg, percent, cb){
        mask.show();
        progressWrap.show();
        progressStatusHolder.text(msg);
        progressBar.css('width', percent);
        if (cb){
            cb();
        }
    }

    function initJcrop(){
        // Create variables (in this scope) to hold the API and image size
        var boundx,
            boundy,
        
        // Grab some information about the preview pane
        $preview = $('#preview-pane'),
        $pcnt = $('#preview-pane .preview-container'),
        $pimg = $('#preview-pane .preview-container img'),
        
        xsize = $pcnt.width(),
        ysize = $pcnt.height();
        
        console.log('init',[xsize,ysize]);

        $('#target').Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: xsize / ysize
        },function(){
            // Use the API to get the real image size
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            // Store the API in the jcrop_api variable
            jcrop_api = this;
            jcrop_api.animateTo([50, 50, 200, 200]);
            
            // Move the preview into the jcrop container for css positioning
            //$preview.appendTo(jcrop_api.ui.holder);
        });
        
        function updatePreview(c){
            if (parseInt(c.w) > 0) {
                var rx = xsize / c.w;
                var ry = ysize / c.h;
                
                $pimg.css({
                    width: Math.round(rx * boundx) + 'px',
                    height: Math.round(ry * boundy) + 'px',
                    marginLeft: '-' + Math.round(rx * c.x) + 'px',
                    marginTop: '-' + Math.round(ry * c.y) + 'px'
                });
            }
        };
    } 

    function showLoading(){
        tools.hide();
        loading.show();
    }

    function reUpload(){
        tools.hide();
        camera.show();
        reUploadMain.stop().animate({
                right: '35px'
            },
            0);
    }

    function showImg(){
        tools.hide();
        imgArea.show();
        reUploadMain.stop().animate({
                right: '-35px'
            },
            300);
    }

    function showError(msg){
        msg = msg || '上传失败';
        tools.hide();
        errorPanel.find('.loadingText>b').text(msg);
        errorPanel.show();
    }

    function checkSubmt(){
        if (!jcrop_api){
            return false;
        }
        var hasChecked = true;
        workForm.find('input[type=text]').each( function(index, val) {
             if ($(this).val().trim().length==0){
                hasChecked = false;
             }
        });
        if (hasChecked){
            saveBtn.attr('disabled', false);
        }else{
            saveBtn.attr('disabled', true);
        }
    }

    function getCropInfo(){
        var info = jcrop_api.tellSelect();
        var bigImg = previewPane.find('img')
        var thumbnailVal = bigImg.width()/originWidth;
        var offsetLeft = Math.abs(parseInt(bigImg.css('margin-left')))*2;
        var offsetTop = Math.abs(parseInt(bigImg.css('margin-top')))*2;
        return '?imageMogr2/thumbnail/!'+(thumbnailVal*200).toFixed(2)+'p/crop/!'+minTargetWidth*2+'x'+minTargetHeight*2+'a'+offsetLeft+'a'+offsetTop;
    }

    function submitForm(e){
        e.preventDefault();
        var postData = {
            cropImg: originImgUrl+getCropInfo(),
            enname: $("#inputEnName").val(),
            zhname: $("#inputZhName").val(),
            department: $("#inputDepartment").val(),
        };


        var filePart = originImgUrl.split('/');
        var fileName = filePart[filePart.length-1];

        var getQinXhr = new XMLHttpRequest();
        getQinXhr.open('GET', postData.cropImg, true);
        getQinXhr.responseType = 'blob';

        showProgress('正在计算人像图片', '40%');

        getQinXhr.onload = function(e) {
          if (this.status == 200) {
            
            //submit to server
              var formData = new FormData();
              formData.append('name', postData.zhname);
              formData.append('ename', postData.enname);
              formData.append('department', postData.department);
              formData.append('file', this.response);
              formData.append('fileName', fileName);

              var postServerXhr = new XMLHttpRequest();
              postServerXhr.open('POST', 'upload.do', true);
              //postServerXhr.open('POST', '/pic/upload.do', true);
              postServerXhr.onload = function(e) { 

                var url = JSON.parse(this.response).imagePath;

                showProgress('正在加载合生图片', '90%');
                var combinImg = new Image();
                combinImg.onload = function(){
                    showProgress('工牌制作完成', '100%');
                    setTimeout(function(){
                        showCombinImg(url);
                    }, 500);
                };
                combinImg.src = url;
              };

              postServerXhr.send(formData);

              showProgress('正在合生工作牌', '70%');

          }
        };

        getQinXhr.send();
        
    }

        
    function showCombinImg(url){
        progressWrap.hide();
        combinImg.children('img')[0].src=url;
        combinImg.show();
        combinImg.find('.viewImg').attr('href', url);
    }

    function completeMake(){
        combinImg.hide();
        mask.hide();
    }

    function reMark(){
        combinImg.hide();
        mask.hide();
        reUpload();
    }

    combinImg.find('.complete').bind('click', completeMake);

    combinImg.find('.redo').bind('click', reMark);


    saveBtn.bind('click', submitForm);

    reloadBtn.bind('click', function(){
        reUpload();
    });

    workForm.find('input[type=text]').each(function(){
        var root = $(this);
        var target = $(this).attr('data-target');
        root.keydown(function(event) {
            setTimeout(function(){
                if (root.val().trim().length==0){
                    $('#'+target).text(root.attr('placeholder'));
                }else{
                    $('#'+target).text(root.val());
                }
                checkSubmt();
            }, 0);
        });
    });

    workForm.find('select').change(function(){
        var root = $(this);
        var target = $(this).attr('data-target');
        var colorCls = $(this).find("option:selected").attr('data-color');
        $('#'+target)[0].className = '';
        $('#'+target).text(root.val()).addClass(colorCls);
    })

    //initJcrop();
});