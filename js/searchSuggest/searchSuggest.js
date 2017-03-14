/**
 * Created by liutongtong on 2017/2/21.
 *
 * require class, jQuery, template
 *
 */
 (function($){
 	if(window.SearchSuggest){
 		return;
 	}

 	var config = {
        carrier: ".J-searchSuggest",    //input selector
        dataContainerClass: "", //存放数据的select容器，页面存在select隐藏域，优先使用隐藏域数据
        data: [{name: "SKU1",type:"1"},{name: "SKU2",type:"2"},{name: "SKU3",type:"3"}],       //模板数据
        template : '<li data-input="{input}" data-type="{{=type}}">使用 {input} 搜索 {{= name}} </li>',   //模板字符串,{input}是输入框预留字段
        form: "#searchForm" //表单id
    };

    var ISearchSuggest = new Abstract(/** @lends 类名 */{
        /**
         * 相关描述
         * @param  {类型} 参数名
         * @return {类型} 说明
         */
         show: function() {},
         hide: function() {}
     });

    // 构造函数
    var SearchSuggest = new Clazz(ISearchSuggest, { config: config, inherit: Component }, function(cfg){
        // 初始化this.config 相当于 extend(this.option, cfg)
        this.setConfig(cfg);
        this._init();
    });

    SearchSuggest.extend({
    	_init: function(){
    		var cfg = this.config;

    		this.elems.$carrier = $(cfg.carrier);
            this.elems.$carrier.after('<ul class="J-searchSuggest-list searchSuggest-list"></ul>'); //创建提示列表
            this.elems.$dataElem = $(cfg.dataContainerClass); //数据元素
            this.elems.$listElem = $(".J-searchSuggest-list");
            this.elems.$htmlTemp = this._initTemp();  //初始化提示模板
            this.elems.$content = "";   //提示内容

            this._initEvent();
        },

        _initEvent: function () {
        	var that = this;
        	var $carrier = this.elems.$carrier;
            //监听输入变化，propertychange: ie 6 7 8, input: others
            $carrier.on('input propertychange', function(event) {
            	if ($.trim($carrier.val()) == "") {
            		that.hide();
            	} else {
            		that.show();
            	}
            });

            $carrier.on('focus', function(event) {
            	if ($.trim($carrier.val()) == "") {
            		that.hide();
            	} else {
            		that.show();
            	}
            });

            //点击建议列表事件
            this.elems.$listElem.on('mousedown', function(event) {
            	that.fire("selected");
//                $(that.config.form).submit();
});

            $carrier.on('blur', function(event) {
            	that.hide();
            });

            // ie9 按删除和退格键不触发的bug修复
            if ($.browser.msie && $.browser.version === '9.0') {
            	$carrier.on('keyup', function(e) {
            		keyCode = e.keyCode;

            		if ((keyCode === 8 || keyCode === 46)) {
            			if ($.trim($carrier.val()) == "") {
            				that.hide();
            			} else {
            				that.show();
            			}
            		}
            	});

            }
        },

        _initTemp: function(){
        	var suggestTemp = this.config.template;
        	var suggestHtml = "";
        	var suggestData = [];

            //从容器中取数据
            if (this.elems.$dataElem.length > 0) {
            	$.each(this.elems.$dataElem[0].options, function(index, el) {
            		suggestData.push({name: el.text,type: el.value});
            	});
            } else {
            	suggestData = this.config.data;
            }

            $.each(suggestData, function(index, el) {
            	suggestHtml += template(suggestTemp, el);
            });
            return suggestHtml;
        },

        show: function(){
        	var input = $.trim(this.elems.$carrier.val());
        	if (input.length > 40) {
        		input = input.substring(0,40) + "...";
        	}
        	this.elems.$content = this.elems.$htmlTemp.replace(/{input}/g, input);
        	this.elems.$listElem.html(this.elems.$content).show();
        	this.fire("show");
        },

        hide: function() {
        	this.elems.$listElem.css("display","none");
        	this.fire("hide");
        }
    });

    window.SearchSuggest = SearchSuggest;
})(jQuery)