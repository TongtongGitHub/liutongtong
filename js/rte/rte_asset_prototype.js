/*
    rich text editor
    dependency: jquery, artdialog
*/

(function () {
    if(window.RTE){
        return;
    }

    var defaultConfig = {
        toolbar:".toolbar", //工具栏类名
        textarea:".rteContent" //富文本编辑区类名
    };

    //原型模式创建实例
    var RichTextEditor = function(cf) {
        this.config = $.extend({}, defaultConfig, cf);
        this._init();
    }

    RichTextEditor.prototype._init = function () {
        var _this = this;
        tinymce.init({
                    selector: _this.config.textarea,  // 富文本作用的标签，语法同css选择器，这个元素会被一个iframe替换，实际作用在iframe中。
                    plugins : 'autolink link image lists charmap print preview media code table textcolor autoresize', //插件配置，可以使用自带的或自定义的插件
                    toolbar: false, //是否显示默认工具栏
                    menubar: false, //是否显示默认菜单栏
                    skin: "",

                    resize: false, //可否手动收缩大小
                    statusbar: false, //是否显示底部状态栏

                    browser_spellcheck: true, //开启语法检查
                    contextmenu: false, //右键菜单s
                    autoresize_min_height: 350,
                    autoresize_max_height: 350,
                    autoresize_bottom_margin: 0,
                    table_grid:false,

                    setup: function (rteEditor) {
                        rteEditor.on('init', function () {
                            //工具栏时间响应
                            $(_this.config.toolbar).on("click", function(event) {
                                var command = event.target.getAttribute("data-command");
                                var value = event.target.getAttribute("data-command-value")

                                if(command == "showLink"){
                                    showLinkDialog(rteEditor);
                                }else if(command == "insertTable"){
                                    var tableHTML = '<table width="100%"><tbody><tr><td>&nbsp;</td></tr></tbody></table>';
                                    rteEditor.execCommand("mceInsertContent", false, tableHTML);
                                }else if(command == "insertVideo"){
                                    showVedioDialog(rteEditor);
                                }else if(command == "insertImage"){
                                    showImageDialog(rteEditor);
                                }else if(command == "editCode"){
                                    //使用自带的源代码编辑插件
                                    rteEditor.execCommand("mceCodeEditor", false, value);
                                }else {
                                    rteEditor.execCommand(command,false, value);
                                }
                                showSourceCode(rteEditor);
                            });
                            //编辑源代码
                            $("#sourceCode").blur(function(event) {
                                editSourceCode(rteEditor);
                            });
                        });
                    }
                });
    }

    function showSourceCode(rteEditor){
        $("#sourceCode").val(rteEditor.getContent({source_view: true}));
    }

    function editSourceCode(rteEditor){
        rteEditor.focus();

        rteEditor.undoManager.transact(function() {
            rteEditor.setContent($("#sourceCode")[0].value);
        });

        rteEditor.selection.setCursorLocation();
        rteEditor.nodeChanged();
    }

    function showLinkDialog (editor) {
        //获取当前选中的节点
        var currentNode = editor.selection.getNode();
        //找到距离当前节点最近的a节点
        var linkNode = editor.dom.getParent(currentNode,"a");

        var linkDialog = new artDialog({
            content: '<div class="link">Link to: <input type="text" name="linkAddress" id="linkAddress"></div>' + 
                     '<div class="target">Open this link in: <select class="linkTarget" id="linkTarget"><option value="_self">same window</option><option value="_blank">new window</option></select></div>' +
                     '<div class="title">Link title: <input type="text" name="linkTitle" id="linkTitle"></div>',
            title: 'Insert Link',        // 标题. 默认'消息'
            // init: null,                  // 对话框初始化后执行的函数
            // close: null,             // 对话框关闭前执行的函数
            okVal:"insert link",
            ok:function(){
                editor.execCommand("mceInsertLink",false, {href:$("#linkAddress").val(),title:$("#linkTitle").val(),target:$("#linkTarget").val()});
            },
            cancelValue: 'cancel',
            cancel: function () {

            },
            padding: '10px',                // 内容与边界填充距离
            lock: true,             // 是否锁屏
        });
        //如果当前节点为超链接，显示remove button
        if(linkNode){
            linkDialog.button([{
                name: 'remove link',
                disabled: false,
                callback: function () {
                    editor.dom.remove(linkNode, true); // true keep children
                }
            }]);
        }
    }

    function showVedioDialog(editor){
        var videoDialog = new artDialog({
            content: '<div class="video"><textarea name="videoContent" id="videoContent"></textarea>',
            title: 'Insert Video',        // 标题. 默认'消息'
            // init: null,                  // 对话框初始化后执行的函数
            // close: null,             // 对话框关闭前执行的函数
            okVal:"insert video",
            ok:function(){
                editor.execCommand("mceInsertRawHTML",false, $("#videoContent").val());
            },
            cancelValue: 'cancel',
            cancel: function () {

            },
            padding: '10px',                // 内容与边界填充距离
            lock: true,             // 是否锁屏
        });
    }

    function showImageDialog (editor) {
        var imageDialog = new artDialog({
            content: '<div class="image">URL: <input type="text" name="imageContent" id="imageContent"></input>' +
                     '<span id="uploader" style="display:none"></span>',
            title: 'Insert Image',        // 标题. 默认'消息'
            init: function(){               // 对话框初始化后执行的函数
                var uploader = new FOCUS.widget.Upload({
                    uploadURL: '/uc/user/file/upload', // 上传的目标URL
                    fileTypes: '*.png, *.jpg', // 允许选择的文件类型
                    sizeLimit: '10MB', // 单个文件尺寸限制
                    timeout: 100000, // 单次上传操作超时设置(ms)
                    multiple: false, // 允许多选
                    button: {
                        text: 'Upload Image' // 按钮显示的文字
                    }
                });
            },                  
            // close: null,             // 对话框关闭前执行的函数
            okVal:"insert image",
            ok:function(){
                var imageHTML = "<img src=" + $('#imageContent').val() + " alt='' />";
                editor.execCommand("mceInsertContent",false, imageHTML);
            },
            cancelValue: 'cancel',
            cancel: function () {

            },
            padding: '10px',                // 内容与边界填充距离
            lock: true,             // 是否锁屏
        });
    }

    window.RTE = RichTextEditor;
})()