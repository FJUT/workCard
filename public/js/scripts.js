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
    var uploadIpt = $("#uploadIpt");
    var allowImgType = {
        jpeg: 'allow',
        jpg: 'allow',
        png: 'allow'
    };

    uploadIpt.bind('change', checkImgType);

    function checkImgType(e){
        var file = this.files[0];
        var type = file.type.split('/');
        var size = file.size;
        if (type[0]!='image' || !allowImgType[type[1]]){
            return  showError("图片格式不正确！(仅支持jpg/png)");
        }
        if (size> 5*1024*1024){
            return  showError("图片大小不能超过5M！");
        }
        var url = window.URL.createObjectURL(file);
        loadImg(url);
    }

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
        var file =  uploadIpt[0].files[0];

        //submit to server
          var formData = new FormData();
          formData.append('zhname', $("#inputZhName").val());
          formData.append('enname', $("#inputEnName").val());
          formData.append('department', $("#inputDepartment").val());
          formData.append(file.name, file);
          //formData.append('fileName', fileName);

          var postServerXhr = new XMLHttpRequest();
          postServerXhr.open('POST', '/api/upload', true);
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