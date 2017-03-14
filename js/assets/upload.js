/**
* upload
* @version 0.7.0
* @namespace FOCUS.widget
* @author lvxiang
*/
window.FOCUS = window.FOCUS || {};
;void function(window, document, undefined){
	this.UUID = new Date().valueOf().toString(16).toUpperCase();
	
	this.namespace = function(){
		var args = [].slice.call(arguments);
		var ns, tmp, prev;
		var ret = [];

		while(args.length){
			ns = args.shift().split(/\./);
			prev = window;

			while(ns.length){
				tmp = ns.shift();
				if(!prev[tmp]){
					prev[tmp] = {};
				}

				prev = prev[tmp];
			}
			
			ret.push(prev);
		}
		
		return ret.length > 1 ? ret : ret[0];
	};
	

	this.BASEPATH = window.FOCUS_BASEPATH || function(scripts){
		var location = window.location;
		var domain = /^(\w+\:\/{2,3}.+?)\//.exec(location.href)[1];
		//var r_base = /(^\/?|.*?\/)FOCUS\/[^?#]+\.js(?:[?#].*)?$/;
		var r_base = /(.*?\/)(?:[^\/]*?(?:base|upload|transmitter)[^\/]*?)\.js(?:[?#].*)?$/i;
		var r_isAbsPath = /^\w+\:\/\//;
		var r_isBackslash = /^\//;
		var r_path = /^.*\//;
		var base;
		var match;
		
		for(var i = 0, len = scripts.length; i < len; i++){
			var url = scripts[i].src;
			if(!r_isAbsPath.test(url)){
				if(r_isBackslash.test(url)){
					url = domain + url;
				}else{
					url = r_path.exec(location.href)[0] + url;
				}
			}else{ }
			
			match = r_base.exec(url);
			
			if(match){
				base = match[1];
				break;
			}
		}
		
		if(!base){
			base = r_path.exec(location.href)[0];
		}else{
			//if(location.protocol !== 'file:'){
				if(!r_isAbsPath.test(base)){
					base = base.replace(new RegExp(location.protocol + '\\/\\/' + location.host, 'i'), '');
					base = location.protocol + '\/\/' + location.host + base;
				}else{}
				
			//}else{ }
		}
		
		return base;
	}(document.getElementsByTagName('script'));
}.call(FOCUS, this, this.document);
;void function(){
	var BASEPATH = this.BASEPATH;
	this.PATH_CHARSET = BASEPATH + 'swf/transform4Charset.swf';
	this.PATH_FLASH = BASEPATH + 'swf/swfupload.swf';
	this.PATH_FLASH_FP9 = BASEPATH + 'swf/swfupload_fp9.swf';
}.call(FOCUS);
;void function(window, document, undefined){
	var util = this.namespace('FOCUS.util');
	
	/**
	* type
	*/
	util.type = function(o){
		var _type;
		var r_native = /\{\s*\[native\s*code\]\s*\}/i;
		
		if(o === null){
			//for IE, use toString, it's '[object Object]'
			//for FF/Opera, it's '[object Window]'
			_type = 'null';
		}else if(typeof o === 'undefined'){
			//for IE, use toString, it's '[object Object]'
			//for FF/Opera, it's '[object Window]'
			_type = 'undefined';
		}else{
			_type = Object.prototype.toString.call(o).match(/\w+/g)[1].toLowerCase();
			
			//IE native function
			if(_type === 'object' && r_native.test(o + '')){
				_type = 'function';
			}
		}
		
		return _type;
	};
	
	/*
	* trim
	*/
	util.trim = function(str){
		return (str + '').replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, '');
	};
	
	/*
	* JSON
	*/
	util.JSON = function(JSON){
		var _JSON = {};
		if(JSON){
			_JSON.stringify = JSON.stringify;
		}else{
			_JSON.stringify = function(){ return '' };
		}
		
		_JSON.parse = function(jsonStr){
			var ret;
			
			if(util.type(jsonStr) === 'string'){
				try{
					ret = new Function('return ' + jsonStr)();
				}catch(ex){
					ret = {};
				}
			}else{
				ret = jsonStr;
			}
			
			return ret;
		};
		
		return _JSON;
	}.call(this, window.JSON);
	
	
	/**
	* browser
	*/
	util.browser = function(ua){
		var r_msie = /msie\s*(\d+\.\d+)/;
		var r_ff = /firefox\/(\d+\.\d+)/;
		var r_webkit = /webkit\/(\d+\.\d+)/;
		var r_chrome = /chrome\/(\d+\.\d+)/;
		var r_safari = /safari\/(\d+\.\d+)/;
		var r_opera = /opera/;
		var r_ver = /version\/(\d+\.\d+)/;
		
		var ret = {};
		var match;
		
		match = r_msie.exec(ua);
		if(match){
			ret.msie = true;
			ret.version = match[1];
			
			return ret;
		}
		
		match = r_ff.exec(ua);
		if(match){
			ret.mozilla = ret.firefox = true
			ret.version = match[1];
			
			return ret;
		}
		
		match = r_webkit.exec(ua);
		if(match){
			ret.webkit = true;
			ret.version = match[1];
			
			if(window.chrome){
				ret.chrome = true;
				ret.version = r_chrome.exec(ua);
				if(ret.version){
					ret.version = ret.version[1];
				}
				
				return ret;
			}
			
			match = r_safari.exec(ua);
			if(match){
				ret.safari = true;
				ret.version = [1];
			}
			
			return ret;
		}
		
		match = r_opera.exec(ua);
		if(match && window.opera){
			ret.opera = true;
			ret.version = r_ver.exec(ua)[1];
		}

		return ret;
		
	}.call(this, window.navigator.userAgent.toLowerCase());
	
	/*
	* flash plugin
	*/
	util.flash = function(nav, plugins){
		var flash = {
			has: false,
			version: 0
		};

		//flash check
		var SHOCKWAVE_FLASH = "Shockwave Flash";
		var SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash";
		var FLASH_MIME_TYPE = "application/x-shockwave-flash";

		try{
			var rv = /\d+/g;
			var ax = new ActiveXObject(SHOCKWAVE_FLASH_AX);
			
			rv.exec('');
			
			flash = {
				has: true,
				version: ax.GetVariable("$version").match(rv).join('.')
			};
		}catch(ex){
			if(plugins.length
				&& plugins[SHOCKWAVE_FLASH]
				&& plugins[SHOCKWAVE_FLASH].description
				&& !(typeof nav.mimeTypes !== 'undefined'
					&& nav.mimeTypes[FLASH_MIME_TYPE]
					&& !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)
			){ // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				flash = {
					has: true,
					version: /\d+\.\d+/.exec(plugins[SHOCKWAVE_FLASH].description)[0]
				};
			}
		}
		
		return flash;
	}.call(this, window.navigator, window.navigator.plugins);
	
	/**
	* extend
	*/
	util.extend = function(){
		var me = arguments.callee;
		var start, override;

		if(util.type(arguments[0]) !== 'object'){
			start = 1;
			override = !!arguments[0];
		}else{
			start = 0;
			override = false;
		}

		var tar = arguments[start] || {};
		var args = [].slice.call(arguments, start + 1);
		
		var tmp;
		var type;
		while(args.length){
			tmp = args.shift();
			if(util.type(tmp) !== 'object'){
				continue;
			}
			
			var t;
			for(var key in tmp){
				t = tmp[key];
				
				if(util.type(t) === 'object'){
					if(t == window || t == document || ('childNodes' in t && 'nextSibling' in t && 'nodeType' in t)){
						if(!(!override && (key in tar))){
							tar[key] = t;
						}
						
						continue;
					}
					
					type = util.type(tar[key]);
					if(!(key in tar) || type === 'undefined' || type === 'null'){
						tar[key] = {};
					}
					
					if(util.type(tar[key]) === 'object'){
						me(override, tar[key], t);
					}
				}else if(!(!override && (key in tar))){
					tar[key] = t;
				}
				
			}
		}
		
		return tar;
	};
	
	/*
	* log4js
	*/
	util.console = function(console){
		var logStat = false;
		var noop = function(){};
		
		var SWITCH = {
			ON: true,
			OFF: false
		};
		
		var _loger = {
			SWITCH: SWITCH,
			turn: function(stat){
				logStat = SWITCH[!!stat ? 'ON' : 'OFF'];
			},
			log: noop,
			info: noop,
			warn: noop,
			error: noop,
			debug: noop
		};
		
		if(!console){
			return _loger;
		}
		
		if(!console.debug){
			console.debug = console.log;
		}
		
		if(!console.error){
			console.error = console.warn;
		}
		
		return util.extend(true, _loger, {
			log: function(msg){
				if(logStat === SWITCH.ON){
					console.log(msg);
				}
			},
			info: function(msg){
				if(logStat === SWITCH.ON){
					console.info(msg);
				}
			},
			warn: function(msg){
				if(logStat === SWITCH.ON){
					console.warn(msg);
				}
			},
			error: function(msg){
				if(logStat === SWITCH.ON){
					console.error(msg);
				}
			},
			debug: function(msg){
				if(logStat === SWITCH.ON){
					console.debug(msg);
				}
			}
		});
	}.call(window, window.console);
	
	/*
	* indexOf
	*/
	util.indexOf = function(items, value){
		if(items.indexOf){
			return items.indexOf(value);
		}
		
		var ret = -1;
		var i = 0, len = items.length;
		for(; i < len; i++){
			if(items[i] === value){
				ret = i;
				break;
			}
		}
		
		return ret;
	};
	
	/*
	* unique array
	*/
	util.unique = function(arr){
		var ret = [];
		
		for(var i = 0, len = arr.length; i < len; i++){
			if(util.indexOf(ret, arr[i]) === -1){
				ret.push(arr[i]);
			}
		}
		
		return ret;
	};
	
	/*
	* random  -- Int
	*/
	util.random = function(){
		var cache = {};
		
		return function(min, max, clear){
			min = min || 0;
			max = util.type(max) === 'number' && !isNaN(max)
				? max === min
					? max + 10
					: max
				: min + 10;
			
			var group = min + '_' + max;
			
			if(!cache[group]){
				cache[group] = [];
			}
			
			if(cache[group].length === max - min){
				cache[group] = [];
				util.type(clear) === 'function' && clear.call(this);
			}
			
			var ret;
			while(true){
				ret = min + ~~(Math.random() * (max - min));
				if(util.indexOf(cache[group], ret) === -1){
					cache[group].push(ret);
					break;
				}
			}
			
			return ret;
		};
	}.call(this);
	
	/**
	* create element
	*/
	util.createElement = function(){
		var closeSelf = ',meta,base,link,img,input,br,hr,area,sharp,';
	
		var tagStrConstructor = function(config){
			var cfg = util.extend(true, {}, config);
			
			var fragment = ['<', cfg.el];
			var el = cfg.el;
			delete cfg.el;
			
			for(var name in cfg){
				fragment.push(' ', name, '="', cfg[name], '"');
			}
			
			fragment.push((closeSelf.indexOf(',' + el + ',') === -1 ? ('></' + el + '>') : ' />'));
			
			return fragment.join('');
		};
		
		//elems generator
		var _createElem = function(config, doc){
			doc = doc || document;

			var cfg = {};
			util.extend(true, cfg, config);
			
			var isTextarea = cfg.el.toLowerCase() === 'textarea';
			var el = tagStrConstructor(cfg);
			var elem;

			var fail = false;
			
			try{
				elem = doc.createElement(el);
			}catch(ex){
				fail = true;
				elem = doc.createElement(cfg.el);
				delete cfg.el;
			}
			
			if(fail){
				for(var key in cfg){
					elem[key] = cfg[key];
				}
			}
			
			if(isTextarea){
				elem.value = cfg.value;
			}
			
			if(elem.tagName.toLowerCase() === 'input'){
				var type = cfg.type ? cfg.type : 'text';
				elem.type = type;
			}
			
			return elem;
		};
		
		return _createElem;
	}.call(this);
	
	/*
	* event
	*/
	util.event = function(){
		var __bind = function(standard){
			return standard
				? function(elem, type, event){
					elem.addEventListener(type, event, false);
				}
				: function(elem, type, event){
					elem.attachEvent('on' + type, event);
				}
		}.call(this, !!window.addEventListener);
		
		var __remove = function(standard){
			return standard
				? function(elem, type, event){
					elem.removeEventListener(type, event);
				}
				: function(elem, type, event){
					elem.detachEvent('on' + type, event);
				}
		}.call(this, !!window.removeEventListener);
		
		var prefix = 'FOCUS_EVENTS_'
		var uuid = (new Date).valueOf();
		var group = prefix + uuid;
		
		var execEvent = function(e, events){
			for(var i = 0, len = events.length; i < len; i++){
				events[i].handler.apply(this, [e].concat(events[i].params));
			}
		};
		
		var find = function(events, event){
			var ret = -1;
			for(var i = 0, len = events.length; i < len; i++){
				if(events[i].handler === event){
					ret = i;
					break;
				}
			}
			
			return ret;
		};
		
		var _bind = function(elem, type, event){
			if(!elem[group]){
				elem[group] = {};
			}
			
			var events = elem[group];
			
			if(!events[type]){
				events[type] = [];
				__bind(elem, type, function(e){
					e = e || window.event;
					
					execEvent.call(elem, e, events[type]);
				});
			}
			
			events[type].push({
				handler: event,
				params: [].slice.call(arguments, 3)
			});
		};
		var _remove = function(elem, type, event){
			if(!elem[group] || (elem[group] && !elem[group][type]) || (elem[group] && !elem[group][type].length)){
				return; 
			}
			
			var events = elem[group][type];
			if(!event){
				events = [];
				return;
			}
			
			var index = find(events, event);
			if(index == -1){
				return;
			}
			
			events.splice(index, 1);
		};
		
		return {
			bind: _bind,
			remove: _remove
		};
	}.call(this);
	
	/*
	* upload environment feature
	*/
	util.feature_upload = function(nav){
		var _flash = function(){
			var flash = util.flash;
			var v = (flash.version + "").split('.');
			var v0 = parseInt(v[0], 10);
			var v1 = parseInt(v[1] || 0, 10);
			var v2 = parseInt(v[2] || 0, 10);
			// 9.0.28+
			var ret = flash.has && (v0 > 9 || (v0 === 9 && (v1 > 0 || (v1 === 0 && v2 >= 28))));
			
			//win vista/7 + flash plugin 11.3 + ff 4-13 == problem
			if(flash && flash.has && nav.oscpu && util.browser.firefox && util.browser.version >= 4 && util.browser.version <= 13){
				var r_sys = /windows\s*nt\s*([\d\.]+)/i;
				var match = r_sys.exec(nav.oscpu);
				
				if(match && (/^6\.0/.test(match[1]) || /^6\.1/.test(match[1])) && /^11\.3/.test(flash.version)){
					ret = false;
				}
			}
			
			return ret;
		}.call(this);
		
		var _html5 = function(){
			if(util.browser.firefox && util.browser.version < 3.6){
				return false;
			}
			
			var ret = {};
			
			var fileElem = document.createElement('input');
			fileElem.type = 'file';
			fileElem.style.cssText = 'position:absolute; top:-999px; height:-999px;';
			document.body.appendChild(fileElem);
			
			//setTimeout(function(){
				ret.file = !!fileElem.files;
				ret.multiple = ('multiple' in fileElem) && !(util.browser.apple && util.browser.version < 6);
				
				document.body.removeChild(fileElem);
				delete fileElem;
			//}, 25);
			
			if(!window.XMLHttpRequest){
				ret = false;
				return ret;
			}
			
			var xhr = new XMLHttpRequest();
			//standard html5 xhr object
			ret.upload = !!xhr.upload;
			//ff
			ret.sendAsBinary = !!xhr.sendAsBinary;
			//native FormData
			ret.FormData = !!window.FormData && !window.FormData.customized;
			
			delete xhr;
			
			return ret;
		}.call(this);
		
		var _iframe = function(){
			var ret = {};
			var domain = document.domain;
			var host = window.location.host || window.location.hostname;
			
			ret.sameDomain = domain === host;
			
			return ret;
		}.call(this);
		
		return {
			html5: _html5,
			flash: _flash,
			iframe: _iframe
		};
	}.call(this, window.navigator);
	
	util.sizeConvert = function(){
		var Unit = {
			KB: 1024,
			MB: 1024 * 1024,
			GB: 1024 * 1024 * 1024/*,
			TB: 1024 * 1024 * 1024,
			PB: 1024 * 1024 * 1024 * 1024*/
		};
		
		var UnitSize = function(size, unit){
			this.size = size;
			this.unit = unit;
		};
		
		UnitSize.prototype = {
			toString: function(){
				return this.size + ' ' + this.unit;
			},
			valueOf: function(){
				return this.size;
			}
		};

		var r_unit = /^((?:\d+)(?:\.\d+)?)\s*([A-Za-z]*)$/g;
		var r_hasUnit = /([A-Za-z]+)$/;
		
		/*
		* convert Size with Unit to Size in bytes
		*/
		var _unit2Bytes = function(unitSize){
			var size = 0;
			
			if(r_hasUnit.test(unitSize)){
				r_unit.exec('');
				var unit = r_unit.exec(unitSize);
				if(unit){
					size = (parseFloat(unit[1]) || 0) * (unit[2] ? Unit[unit[2].toUpperCase()] : 1024);
				}else{}
			}else{
				size = parseInt(unitSize) || 0;
			}
			
			//size === 0  ===> no size limit(-1)
			size = size || 0;

			return size;
		};
		
		
		/*
		* convert Size in bytes to Size with Unit
		*/
		var _bytes2Unit = function(bytes, unit){
			var size = 0;
			var unitList = ['GB', 'MB', 'KB'];
			
			unit = unit || '';
			if(!unit){
				for(var i = 0; i < unitList.length; i++){
					if(bytes > Unit[unitList[i]]){
						unit = unitList[i];
						break;
					}
				}
			}
			
			if(unit){
				size = bytes / Unit[unit];
			}
			
			size = size || 0;
			size = new UnitSize(size, unit);
			
			return size;
		};
		
		return {
			unit2Bytes: _unit2Bytes,
			bytes2Unit: _bytes2Unit
		};
	}.call(this);
	
	//FormData  -- for FireFox 3.x (has no class FromData, has xhr.sendAsBinary)
	if(!window.FormData && util.feature_upload.html5.sendAsBinary){
		window.FormData = function(charset){
			this.charset = charset || 'UTF-8';
			this.reset();
		};
		window.FormData.prototype = {
			append: function(name, content){
				var _data = '';
				var EOL = this.EOL;
				var boundary = '--' + this.boundary;
				
				var type = util.type(content);
				
				if(type === 'object'){
					content = JSON.stringify(content);
					type = 'string';
				}
				
				_data += boundary + EOL;
				_data += 'Content-Disposition: form-data; ';
				
				if(type === 'file'){
					_data += 'name="' + this.encode(name) + '"; ';
					_data += 'filename="' + this.encode(content.filename || content.name) + '"' + EOL;
					_data += 'Content-Type: ' + (content.type ? content.type : 'application/octet-stream') + EOL + EOL;
					_data += content.getAsBinary() + EOL;
				}else{
					_data += 'name="' + this.encode(name) + '"' + EOL + EOL;
					_data += this.encode(content) + EOL;
				}
				
				this.data += _data;
			},
			getData: function(){
				return this.data + '--' + this.boundary + '--' + this.EOL;
			},
			valueOf: function(){
				return this.getData();
			},
			toString: function(){
				return this.getData();
			},
			reset: function(){
				this.data = '';
				// 71 -- Firefox's tradition
				this.boundary = "---------------------------71" + (new Date).valueOf().toString(16).replace(/^0x/, '');
				this.EOL = '\r\n';
			},
			encode: function(str){
				if(util.transformCharset){
					return util.transformCharset(str, this.charset);
				}else{
					return encodeURI(str);
				}
			}
		};
		
		//customized flag
		window.FormData.customized = true;
	}
	
	
	var MIME_TYPE = {
		'*/*':			'*.*',
		'image/*':		'*.jpg; *.jpeg; *.jpe; *.png; *.gif',
		'image/png':	'*.png',
		'image/jpeg':	'*.jpg; *.jpeg; *.jpe',
		'image/jpg':	'*.jpg; *.jpeg; *.jpe',
		'image/gif':	'*.gif',
		'image/bmp':	'*.bmp',
		'application/gzip':		'*.gz',
		'application/zip':		'*.zip',
		'application/vnd.ms-excel':	'*.xls',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':	'*.xlsx',
		'application/msword':	'*.doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document':	'*.docx',
		'application/vnd.ms-powerpoint':	'*.ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation':	'*.pptx',
		'application/mshelp':		'*.hlp; *.chm',
		'application/pdf':			'*.pdf',
		'application/mp3':	'*.mp3',
		'text/html':		'*.html; *.htm; *.xhtml',
		'text/javascript':	'*.js',
		'text/css':			'*.css',
		'text/plain':		'*.txt',
		'default':		'*.*'
	};
	
	var FILE_TYPE = function(mime){
		var exclude = ['image/*', 'image/jpg', 'default'];
		var type = {};
		
		for(var key in mime){
			if(util.indexOf(exclude, key) === -1){
				mime[key].replace(/[^\;\u0020]+/g, function($1){
					type[$1] = key;
				});
			}
		}
		
		return type;
	}(MIME_TYPE);
	
	/*
	* '*.*; *.jpg' to MIME_TYPE
	*/
	util.convert2MimeTypes = function(types){
		types = types.split(/[\;\,]\s*/);
		
		var tmpRet = [];
		var ret = '';
		if(types.length){
			var r = /^[^\/]+\/[^\/]+$/;
			for(var i = 0; i < types.length; i++){
				if(r.test(types[i])){
					tmpRet.push(types[i]);
					continue;
				}
				
				if(types[i] in FILE_TYPE && types[i] !== '*.*'){
					tmpRet.push(FILE_TYPE[types[i]]);
				}else{
					ret = '*/*';
					break;
				}
			}
			
			if(!ret){
				ret = util.unique(tmpRet).join(', ');
			}
		}else{
			ret = '*/*';
		}
		
		return ret;
	};
	
	/*
	* MIME_TYPE to '*.*; *.jpg'
	*/
	util.convertMimeTypes = function(mime){
		mime = mime.split(/[\;\,]\s*/);
		
		var tmpRet = [];
		var ret = '';
		if(mime.length){
			var r = /^[^\\\/]+\.[^\\\/]+$/;
			for(var i = 0; i < mime.length; i++){
				if(r.test(mime[i])){
					tmpRet.push(mime[i]);
					continue;
				}
				
				if(mime[i] in MIME_TYPE && mime[i] !== '*/*'){
					tmpRet.push(MIME_TYPE[mime[i]]);
				}else{
					ret = '*.*';
					break;
				}
			}
			
			if(!ret){
				ret = util.unique(tmpRet).join('; ');
			}
		}else{
			ret = '*.*';
		}
		
		return ret;
	};
	
	/*
	* validate mime type
	*/
	util.mimeValidation = function(mimeSet, sub){
		if((mimeSet + '').indexOf('*/*') !== -1){
			return true;
		}
		
		sub = sub + '';
		var type = util.type(mimeSet);
		if(type === 'string'){
			mimeSet = mimeSet.split(/[\;\,\s]+/);
		}
		
		var ret = false;
		var r = /^([^\/]+)\/([^\/]+)$/;
		var matchSub = r.exec(sub);
		var match;
		
		if(!matchSub){
			return false;
		}
		
		for(var i = 0; i < mimeSet.length; i++){
			match = r.exec(mimeSet[i]);
			if(mimeSet[i] === sub
			|| (match[1] === matchSub[1] && (match[2] === '*' || match[2] === matchSub[2]))){
				ret = true;
				break;
			}
		}
		
		return ret;
	};
	
	/**
	* class
	*/
	util.addClass = function(elem, clazz){
		var clz = util.trim(elem.className).split(/\s+/);
		if(util.type(clazz) === 'string'){
			[].push.apply(clz, clazz.split(/\s+/));
		}
		
		elem.className = util.unique(clz).join(' ');
	};
	
	util.removeClass = function(elem, clazz){
		var clz = util.unique(util.trim(elem.className).split(/\s+/));
		
		if(util.type(clazz) === 'string'){
			clazz = clazz.split(/\s+/);
		}else{
			clazz = [];
		}
		
		var tmpClz;
		var index = -1;
		
		while(clazz.length){
			tmpClz = clazz.shift();
			index = util.indexOf(clz, tmpClz);
			
			if(index !== -1){
				clz.splice(index, 1);
			}
		
		}
		
		elem.className = clz.join(' ');
	};

}.call(FOCUS, this, this.document);






































;void function(window, document, undefined){
	this.namespace('FOCUS.widget');
	
	var util = this.util;
	var widget = this.widget;
	var noop = function(){};
	
	////required swfupload
	//FOCUS.widget.Upload_Flash = SWFUpload;
	
	var envir = function(){
		var feature = util.feature_upload;
		return {
			flash: feature.flash,
			html5: feature.html5 && (feature.html5.upload && /*feature.html5.file && */(feature.html5.sendAsBinary || feature.html5.FormData)),
			iframe: true
		};
	}.call(this);
	

	var upload = widget.Upload = function(cfg){
		upload.__defaults__();
		this.cfg = util.extend(true, {}, upload.defaults);
		
		this.set(cfg);
		if(upload.plugins.UploadEvents){
			this.uploadEvents = new upload.plugins.UploadEvents(this.cfg.events);
			this.set({
				events: this.uploadEvents.events
			});
		}
		this._ = {};
		this.init();
		
		return this.instance;
	};
	
	upload.prototype = {
		init: function(){
			var _this = this;
			var priority = this.cfg.priority;
			
			// 加载 css 文件
			if(this.cfg.css.uri){
				var uri;
				
				if(/^https?:\/\/|^\//i.test(this.cfg.css.uri)){
					uri = this.cfg.css.uri;
				}else{
					uri = FOCUS.BASEPATH + 'css/' + this.cfg.css.uri;
				}
				
				
				if(!upload.__LOADED_CSS__[uri]){
					var link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = uri;
					document.getElementsByTagName('head')[0].appendChild(link);
					
					upload.__LOADED_CSS__[uri] = true;
				}
			}
			
			//setTimeout(function(){
				var type;
				for(var i = 0; i < priority.length; i++){
					if(envir[priority[i]]){
						type = priority[i];
						break;
					}
				}
				
				var CLZ = {
					'html5': 'Upload_HTML5',
					'flash': 'Upload_Flash',
					'iframe': 'Upload_Iframe'
				};
				
				if(type){
					if(type === upload.MODE.FLASH){
						//wrap file object in flash event
						for(var ename in this.cfg.events){
							this.cfg.events[ename] = function(handle, ename){
								var _File = upload.File4Flash;
								return function(file){
									if(file && file.id){
										handle.apply(this, [new _File(file)].concat([].slice.call(arguments, 1)));
									}else{
										handle.apply(this, [].slice.call(arguments, 0));
									}
								};
							}.call(this, this.cfg.events[ename], ename);
						}
				
						this.cfg.fileTypes = util.convertMimeTypes(this.cfg.fileTypes); // mimetype ==> suffix type  ------> TODO
						//this.cfg.placeholder = this.cfg.placeholder.replace(/^#/, '');

						var ready = this.cfg.events.ready;
						this.cfg.events.ready = function(ready){
							return function(){
								// make sure the flash loaded success
								setTimeout(function(){
									_this.instance.isReady = true;
									ready.call(_this.instance, type);
								}, 25);
							};
						}(ready);
					}else{ //
						this.cfg.fileTypes = util.convert2MimeTypes(this.cfg.fileTypes);
					}
					
					// UI & Events contruct
					this.instance = new widget[CLZ[type]](this.cfg);
					
					//if(type !== upload.MODE.FLASH){
						// make sure the dom elements loaded && script excuted
						//setTimeout(function(){
							// callback for choose which type to initialize
							//_this.cfg.events.ready.call(_this.instance, type);
						//}, 25);
					//}else{ //Flash
						//that = this.instance;
						//this.instance = this.instance.instance;
					//}
					
					var plugs = upload.plugins;
					//bind event handle
					if(plugs.UploadEvents){
						this.uploadEvents.bindThisObj(this.instance);
						'on,one,off,fire'.replace(/(\w+)/g, function($1){
							_this.instance[$1] = function(){
								_this.uploadEvents[$1].apply(_this.uploadEvents, arguments);
								return _this.instance;
							};
						});
					}
					
					//<--
					//execute plugins
					for(var pname in plugs){
						pname.replace(/([\$\^\[\]\\\/\,\?\:\|\{\}\!\(\)\*\-\+])/g, '\\$1');
						if(pname !== 'UploadEvents' && new RegExp('(^|,)' + pname + '(,|$)').exec(this.cfg.plugins)){
							plugs[pname].call(this.instance, this.instance.mode);
						}
					}
					/////-->
				}else{
					throw 'not support this constructor.';
				}
			//}, 25);
		},
		set: function(cfg){
			var plugins = this.cfg.plugins;
			if(cfg && cfg.plugins && util.type(cfg.plugins) === 'string'){
				plugins += (',' + cfg.plugins);
				plugins = util.unique(plugins.split(/[,;\s]+/)).join(',');
			}
			
			
			var skin = cfg && cfg.skin;
			var skinCSS = {};
			var css = cfg && cfg.css || {};
			
			if(skin && skin in upload.CSS){
				skinCSS = upload.CSS[skin];
			}
			
			css = util.extend(true, {}, upload.CSS.DEFAULT, this.cfg.css, skinCSS, css);
			
			util.extend(true, this.cfg, cfg, {css: css});
			
			this.cfg.plugins = plugins;
		}
	};
	
	upload.__defaults__ = function(){
		if(upload.defaults){
			return upload.defaults;
		}
		
		return (upload.defaults = {
			priority: upload.PRIORITY.DEFAULT,
			events: {
				ready: noop,
				loadFailed: noop,
				dialogStart: noop,
				dialogComplete: noop,
				queued: noop,
				queueError: noop,
				uploadStart: noop,
				uploadProgress: noop,
				uploadSuccess: noop,
				uploadError: noop,
				uploadComplete: noop
			},
			button: {
				//width: 120,
				//height: 32,
				text: 'Upload'
			},
			multiple: true,
			sizeLimit: -1,
			uploadLimit: -1,
			queueLimit: -1,
			fileTypes: upload.MIME_TYPE.ALL,
			uploadURL: '',
			filePostName: '',
			placeholder: '#uploader',
			debug: false,
			plugins: 'AutoDisabled,Patch4Charset',
			fileTypesDescription: 'All Files',
			//css: upload.CSS['DEFAULT'],
			skin: 'DEFAULT',
			timeout: 600000
		});
	};
	
}.call(FOCUS, this, this.document);










































;void function(window, document, undefined){
	var upload = this.widget.Upload;
	var util = this.util;
	
	var MODE = upload.MODE = {
		HTML5: 'html5',
		FLASH: 'flash',
		IFRAME: 'iframe',
		DEFAULT: 'html5'
	};
	
	upload.PRIORITY = {
		DEFAULT: [ MODE.HTML5, MODE.FLASH, MODE.IFRAME ]
	};
	
	upload.MIME_TYPE = {
		ALL: '*/*',
		IMAGE: 'image/*',
		JPG: 'image/jpeg',
		JPEG: 'image/jpeg',
		PNG: 'image/png',
		GIF: 'image/gif',
		PDF: 'application/pdf',
		DOC: 'application/msword',
		DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		XLS: 'application/vnd.ms-excel',
		XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		PPT: 'application/vnd.ms-powerpoint',
		PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		TXT: 'text/plain',
		UNKNOWN: 'application/octet-stream'
	};
	
	upload.QUEUE_ERROR = {
		QUEUE_LIMIT_EXCEEDED            : -100,
		FILE_EXCEEDS_SIZE_LIMIT         : -110,
		ZERO_BYTE_FILE                  : -120,
		INVALID_FILETYPE                : -130,
		CHAIN_ERROR						: -140 //use iframe method upload, if browser support html5, an error occured on one file object will lead other files to occured error
	};
	
	upload.UPLOAD_ERROR = {
		HTTP_ERROR                      : -200,
		MISSING_UPLOAD_URL              : -210,
		IO_ERROR                        : -220,
		SECURITY_ERROR                  : -230,
		UPLOAD_LIMIT_EXCEEDED           : -240,
		UPLOAD_FAILED                   : -250,
		SPECIFIED_FILE_ID_NOT_FOUND     : -260,
		FILE_VALIDATION_FAILED          : -270,
		FILE_CANCELLED                  : -280,
		UPLOAD_STOPPED                  : -290,
		RESIZE                          : -300,
		TIMEOUT							: -310
	};
	
	upload.FILE_STATUS = {
		QUEUED       : -1,
		IN_PROGRESS  : -2,
		ERROR        : -3,
		COMPLETE     : -4,
		CANCELLED    : -5,
		NEW			 : -6
	};
	
	upload.UPLOAD_TYPE = {
		SINGLE:	1,
		MULTI:	2
	};

	upload.BUTTON_ACTION = {
		SELECT_FILE             : -100,
		SELECT_FILES            : -110,
		START_UPLOAD            : -120,
		JAVASCRIPT              : -130,	// DEPRECATED
		NONE                    : -130
	};
	
	upload.CURSOR = {
		POINTER					: -2,
		DEFAULT					: -1
	};
	
	upload.CSS = {
		DEFAULT: {
			uri: '',
			
			/*WRAP:		'upload-wrap',
			SELECTOR:	'upload-selector',
			FLASH:		'upload-flashwrap',
			TEXT:		'upload-text',
			DISABLED:	'upload-wrap-disabled',
			HOVER:		'upload-wrap-hover'*/
			
			WRAP:		'FOCUS_UPLOAD_wrap upload-wrap',
			SELECTOR:	'FOCUS_UPLOAD_selector upload-selector',
			FLASH:		'FOCUS_UPLOAD_flashWrap upload-flashwrap',
			TEXT:		'FOCUS_UPLOAD_text upload-text',
			DISABLED:	'FOCUS_UPLOAD_wrap_disabled upload-wrap-disabled',
			HOVER:		'FOCUS_UPLOAD_wrap_hover upload-wrap-hover'
		},
		LARGE: {
			uri: '',
			
			WRAP:		'large-upload-wrap',
			SELECTOR:	'large-upload-selector',
			FLASH:		'large-upload-flashwrap',
			TEXT:		'large-upload-text',
			DISABLED:	'large-upload-wrap-disabled',
			HOVER:		'large-upload-wrap-hover'
		}
	};
	
	upload.addSkin = function(name, skin){
		var defaults = {
			uri:		'',
			
			WRAP:		'',
			SELECTOR:	'',
			FLASH:		'',
			TEXT:		'',
			DISABLED:	'',
			HOVER:		''
		};
		
		upload.CSS[name] = util.extend(true, {}, defaults, skin);
	};
	
	upload.removeSkin = function(name){
		delete upload.CSS[name + ''];
	};
	
	// 
	upload.__LOADED_CSS__ = {};
	
	upload.CHARSET = {
		UTF8:		'UTF-8',
		GBK:		'GBK',
		GB2312:		'GB2312',
		BIG5:		'BIG5',
		DEFAULT:	'UTF-8'
	};
	
	upload.TURNING = {
		ON:		true,
		OFF:	false
	};
	
	var _getFilename = function(fullname, ret){
		ret = ret || {};
		
		var nameFrag = fullname.split(/\./);
			
		if(nameFrag.length > 1){
			ret.suffix = nameFrag.pop();
		}else{
			ret.suffix = '';
		}
		
		ret.name = nameFrag.join('.');
		
		return ret;
	};
	
	upload.File = function(file){
		if(!file){
			return;
		}

		var _file = { data: file };
		_file.id = 'FOCUS_UPLOAD_' + (util.random(0, 1000000) + ~~((new Date()).valueOf() / 10000000)).toString(16).toUpperCase();
		
		if(file.tagName && file.tagName.toLowerCase() === 'input' && file.type === 'file'){
			var r_fullname = /[^\/\\]+$/;
			var fullname = r_fullname.exec(file.value);
			if(fullname){
				_file.fullname = fullname[0];
				_getFilename(_file.fullname, _file);
			}
			
			if(_file.suffix){
				_file.type = _file.suffix.toUpperCase() in upload.MIME_TYPE ? upload.MIME_TYPE[_file.suffix.toUpperCase()] : '';
			}else{
				_file.type = '';
			}
		}else{
			_file.size = file.filesize || file.size || 0;
			_file.type = file.type || '';
			_file.fullname = file.filename || file.name || '';
			
			_getFilename(_file.fullname, _file);
			
			if(!_file.type){
				if(_file.suffix){
					_file.type = _file.suffix.toUpperCase() in upload.MIME_TYPE ? upload.MIME_TYPE[_file.suffix.toUpperCase()] : '';
				}else{
					_file.type = '';
				}
			}
		}
		
		_file.status = upload.FILE_STATUS.NEW;
		
		return _file;
	};
	
	upload.File4Flash = function(file){
		if(!file){
			return;
		}

		this.data = file;
		this.id = file.id;
		this.size = file.size;
		this.status = file.filestatus;
		
		_getFilename(file.name, this);
		
		if(file.type){
			this.suffix = file.type.replace(/^\./, '');
		}else{}
		
		this.type = upload.MIME_TYPE[this.suffix.toUpperCase()] || '';
		this.fullname = file.name;
	};
}.call(FOCUS, this, this.document);
;void function(window, document){
	FOCUS.namespace('FOCUS.widget');
	var noop = function(){};
	
	var util = this.util;
	var query = this.query;
	var widget = this.widget;
	var upload = widget.Upload;
	//var CSS = upload.CSS;
	var MODE = upload.MODE;
	var UPLOAD_ERROR = upload.UPLOAD_ERROR;
	var FILE_STATUS = upload.FILE_STATUS;
	
	widget.UploadBase = function(){
		/*this.elems = {};
		this.cfg = {
			priority: FOCUS.widget.Upload.PRIORITY.DEFAULT,
			events: {
				ready: noop,
				loadFailed: noop,
				dialogStart: noop,
				dialogComplete: noop,
				queued: noop,
				queueError: noop,
				uploadStart: noop,
				uploadProgress: noop,
				uploadSuccess: noop,
				uploadError: noop,
				uploadComplete: noop
			},
			button: {
				text: 'Upload'
			},
			// single or multi file(s) selection dialog
			// except: some browser such as ie6-9 not support multiple on input:file
			multiple: true,
			sizeLimit: -1,
			//uploadLimit: -1, //not support now
			queueLimit: -1,
			fileTypes: FOCUS.widget.Upload.MIME_TYPE.ALL,
			fileTypesDescription: 'All Files',
			uploadURL: '',
			filePostName: '',
			placeholder: '',
			charset: FOCUS.widget.Upload.CHARSET.DEFAULT,
			debug: false,
			timeout: 100000,
			css: upload.CSS['DEFAULT'],
			skin: 'DEFAULT'
		};
		
		this._ = {
			queue: [],
			uploadingFile: null
		};*/
	};
	widget.UploadBase.prototype = {
		init: noop,
		set: function(cfg){
			this.cfg = util.extend(true, this.cfg, cfg);
		},
		debug: function(stat){
			util.log.turn(!!stat);
		},
		//Propertis
		//TODO
		
		////////Methods
		startUpload: noop,
		getFile: noop,
		
		//////implementation methods
		cancelUpload: function(callback){
			var file = this.getQueueFile();
			if(file){
				file.status = FILE_STATUS.CANCELLED;
				if(util.type(callback) === 'function'){
					this.one('uploadError', callback);
				}
				this.cfg.events.uploadError.call(this, file, UPLOAD_ERROR.FILE_CANCELLED, 'file cancelled.');
				this.elems.poster && this.elems.poster.abort();
			}
		},
		stopUpload: function(callback){
			var file = this.getQueueFile();
			if(file){
				file.status = FILE_STATUS.QUEUED;
				if(util.type(callback) === 'function'){
					this.one('uploadError', callback);
				}
				this.cfg.events.uploadError.call(this, file, UPLOAD_ERROR.UPLOAD_STOPPED, 'upload stopped.');
				this.elems.poster && this.elems.poster.abort();
				this._.queue.unshift(file);
			}
		},
		getQueueFile: function(arg){
			arg = arg || 0;
			var type = util.type(arg);
			var queue = this._.queue;
			var file = null;
			
			if(type === 'number'){
				if(arg <= queue.length - 1){
					file = queue[arg];
				}else{ }
			}else if(type === 'string'){
				for(var i = 0; i < queue.length; i++){
					if(queue[i].id === arg){
						file = queue[i];
						break;
					}
				}
			}
			
			return file;
		},
		////set
		setPostParam: function(params){
			if(!this.cfg.postParams){
				this.cfg.postParams = {};
			}
			
			util.extend(true, this.cfg.postParams, params);
			
			return this;
		},
		addPostParam: function(key, value){
			if(!this.cfg.postParams){
				this.cfg.postParams = {};
			}
			
			this.cfg.postParams[key] = value;
			
			return this;
		},
		removePostParam: function(key){
			if(!this.cfg.postParams || !key){
				this.cfg.postParams = {};
				return;
			}
			
			if(key in this.cfg.postParams){
				delete this.cfg.postParams[key];
			}
			
			return this;
		},
		setUploadURL: function(url){
			this.cfg.uploadURL = url + '';
			
			return this;
		},
		setFilePostName: function(name){
			this.cfg.filePostName = name + '';
			
			return this;
		},
		//require override
		setFileTypes: function(types){
			this.ready(function(){
				switch(this.mode){
					case MODE.IFRAME:
					case MODE.HTML5: {
						this.cfg.fileTypes = this.elems.selector.accept = util.convert2MimeTypes(types);
					} break;
					case MODE.FLASH: {
						//types = util.convertMimeTypes(types);
					} break;
					default:
				}
				
				//this.cfg.fileTypes = types;
			});
			
			return this;
		},
		setFileSizeLimit: function(limit){
			this.cfg.sizeLimit = limit;
			
			return this;
		},
		//not support now
		/*setFileUploadLimit: function(limit){
			this.cfg.uploadLimit = limit;
		},*/
		setFileQueueLimit: function(limit){
			this.ready(function(){
				this.cfg.queueLimit = limit;
				this.elems.selector.multiple = limit !== 1;
			});

			return this;
		},
		text: function(txt){
			return (typeof txt === 'undefined'
				? this.elems.text && this.elems.text.innerHTML
				: this.elems.text && (this.elems.text.innerHTML = txt + ''));
		},
		__setStyle: function(mode, wrap, selector, text){
			var CSS = this.cfg.css;
			
			wrap.className = CSS.WRAP;
			
			if(util.browser.firefox){
				selector.size = 6;
			}
			
			selector.className = CSS.SELECTOR;
			
			var label;
			label = wrap.getElementsByTagName('label');
			if(label.length){
				wrap.removeChild(label[0]);
			}
			
			label = document.createElement('label');
			label.className = CSS.TEXT;
			label.innerHTML = text;

			if(mode === "iframe" && this.cfg.allowOpen){ // 允许ie调用open方法的模式下，selector 不在当前文档内
				wrap.appendChild(label);
			}else{
				wrap.insertBefore(label, selector);
			}
			
			//hover
			util.event.bind(wrap, 'mouseover', function(e){
				e.cancelBubble = true;
				e.returnValue = false;
				
				util.addClass(wrap, CSS.HOVER);
			});
			util.event.bind(wrap, 'mouseout', function(e){
				e.cancelBubble = true;
				e.returnValue = false;
				
				util.removeClass(wrap, CSS.HOVER);
			});
			
			this.elems.text = label;
		},
		__translateStatus: function(status){
			// status: ON / OFF / true / false
			// disable / able
			var type = util.type(status);
			if(type === 'string'){
				status = util.trim(status);
				if(status.length){
					status = !!upload.TURNING[status.toUpperCase()];
				}else{
					status = upload.TURNING.OFF;
				}
			}else if(type === 'undefined'){
				status = !this._.status;
			}else{
				status = !!status;
			}
			
			return status;
		},
		turn: function(status){
			this.ready(function(){
				var CSS = this.cfg.css;
				status = this.__translateStatus(status);
				// TODO: switch able status
				// flash version require override
				
				if(status !== this._.status){
					this.elems.selector.disabled = !status;
					this._.status = status;
					
					util[status ? 'removeClass' : 'addClass'](this.elems.holder, CSS.DISABLED);
				}
			});

			return this;
		},
		_open: function(){
			this.elems.selector && this.elems.selector.click();
		},
		open: function(){
			//if(this.mode === MODE.IFRAME || this.mode === MODE.HTML5){
				this._open();
			//}else if(this.mode === MODE.FLASH){
			//	this.mouseClick();
			//}

			//return this;
			
			return this;
		},
		multiple: function(isMulti){
			this.ready(function(){
				this.elems.selector.multiple = !!isMulti;
			});

			return this;
		},
		/**
		* try to queue files.
		* -not support flash edition
		*/
		queue: function(){
			if(this.mode === MODE.IFRAME || this.mode === MODE.HTML5){
				//TODO
			}
			
			return this;
		},
		/**
		* remove file out of queue. will not cause the error event.
		* @param {Int|String|Boolean} [arg] remove file out of queue.
			Int: index of the queue, greater than or equal 0
			String: file id of the queue files
			undefined: remove first file in the queue
			Boolean: -true empty the queue. -false remove first file in the queue
		*/
		dequeue: function(arg){
			if(this.mode === MODE.IFRAME || this.mode === MODE.HTML5){
				switch(util.type(arg)){
					case 'string': {
						for(var i = 0; i < this._.queue.length; i++){
							if(this._.queue[i].id === arg){
								arg = i;
								break;
							}
						}
					};
					case 'number': {
						this._.queue.splice(arg, 1);
					}; break;
					case 'undefined': {
						arg = false;
					}; break;
					case 'boolean': {
						if(arg){
							this._.queue.splice(0);
						}else{
							this._.queue.splice(0, 1);
						}
					}; break;
					default:;
				}
			}else if(this.mode === MODE.FLASH){
				switch(util.type(arg)){
					case 'string':
					case 'number': {
						this.instance.cancelUpload(arg, false);
					}; break;
					case 'undefined': {
						arg = false;
					};
					case 'boolean': {
						if(arg){
							var file;
							while(file = this.instance.getQueueFile()){
								this.instance.cancelUpload(file.file_id, false);
							}
						}else{
							this.instance.cancelUpload(0, false);
						}
					}; break;
					default:;
				}
			}
			
			return this;
		},
		ready: function(fn){
			var _this = this;

			setTimeout(function(){
				if(_this.isReady){
					(typeof fn === "function") && fn.call(_this, _this.mode);
				}else{
					_this.one("ready", fn);
				}
			}, 0);

			return this;
		}
	};
}.call(FOCUS, this, this.document);
;void function(window, document){
	var plugs = this.namespace('FOCUS.widget.Upload.plugins');
	var util = this.util;
	var upload = this.widget.Upload;
	var UPLOAD_ERROR = upload.UPLOAD_ERROR;

	//<!-- Event -->
	/**
	* Class Event
	* @constructor
	* @name Event
	* @param {String} type event type
	*/
	var Event = function(type, thisObj){
		this.type = type;
		this.listeners = [];
		this._ = {
			thisObj: thisObj
		};
	};
	Event.prototype = {
		/**
		* @private
		* search handle in listeners
		* @param {Function} handle
		* @param {Number=0} startIndex
		* @return {Number} index of listeners
		*/
		__search: function(handle, startIndex){
			var ret = -1;
			for(var i = startIndex || 0; i < this.listeners.length; i++){
				if(this.listeners[i].handle === handle){
					ret = i;
					break;
				}
			}
			
			return ret;
		},
		/**
		* add events
		* @param {Object} cfg
		* @param {Function[]} cfg.handles
		* @param {Boolean} [cfg.once]
		* @param [cfg.thisObj]
		* @param [args,..]
		*/
		add: function(cfg, args){
			var handles = cfg.handles;
			var thisObj = cfg.thisObj || null;
			var once = cfg.once || false;
			var args = [].slice.call(arguments, 1)

			if(util.type(handles) === 'function'){
				handles = [handles];
			}
			if(util.type(handles) === 'array'){
				for(var i = 0; i < handles.length; i++){
					if(util.type(handles[i]) === 'function'){
						this.listeners.push({
							handle: handles[i],
							thisObj: thisObj,
							once: !!once,
							args: args
						});
					}
				}
			}
		},
		/**
		* add events
		* @param {Object} cfg
		* @param {Function[]} cfg.handles
		* @param {Boolean} [cfg.once]
		* @param [cfg.thisObj]
		* @param [args,..]
		*/
		one: function(cfg, args){
			if(util.type(cfg) !== 'object'){
				return;
			}
			
			cfg.once = true;
			this.add(cfg, [].slice.call(arguments, 1));
		},
		/**
		* remove event
		* @param {Function|Function[]} handles
		*/
		remove: function(handles){
			if(!handles){
				this.listeners = [];
				return;
			}
			if(util.type(handles) === 'function'){
				handles = [handles];
			}
			
			var index;
			for(var i = 0; i < handles.length; i++){
				if(util.type(handles[i]) === 'function' && (index = this.__search(handles[i])) !== -1){
					this.listeners.splice(index, 1);
				}
			}
		},
		/**
		* excute event
		* @param [args,..] event params
		*/
		exec: function(args){
			var listener;
			var onceEvents = [];
			for(var i = 0; i < this.listeners.length; i++){
				listener = this.listeners[i];
				if(listener.once){
					onceEvents.push(listener.handle);
				}
				
				listener.handle.apply(listener.thisObj || this._.thisObj || this, [].concat.call(listener.args, [].slice.call(arguments)));
			}
			
			this.remove(onceEvents);
		},
		/**
		* set this object in event handle excution context
		* @param thisObj
		*/
		bindThisObj: function(thisObj){
			this._.thisObj = thisObj;
		}
	};
	//<!-- Event END -->
	
	//<!-- Upload Events -->
	/**
	* events plugin for upload component
	* @constructor
	* @name UploadEvents
	* @requires FOCUS.base
	* @requires FOCUS.util
	* @requires FOCUS.widget.Upload
	* @requires Event
	* @param events {Object} added events on init
	* @param [thisObj]
	*/
	var UploadEvents = function(events, thisObj){
		this._ = {
			events: {},
			thisObj: thisObj
		};
		
		this.events = {};
		for(var type in events){
			this.on(type, events[type]);
			this.events[type] = function(type){
				var _this = this;
				if(type === 'uploadError'){
					return function(file, code, msg){
						switch(code){
							case UPLOAD_ERROR.FILE_CANCELLED: {
								_this.fire.apply(_this, ['cancel', file, UPLOAD_ERROR.FILE_CANCELLED, 'file cancelled.']);
							}; break;
							case UPLOAD_ERROR.UPLOAD_STOPPED: {
								_this.fire.apply(_this, ['stop', file, UPLOAD_ERROR.UPLOAD_STOPPED, 'upload stopped.']);
							}; break;
							default: {
								_this.fire.apply(_this, [type].concat([].slice.call(arguments)));
							};
						}
					};
				}else{
					return function(){
						_this.fire.apply(_this, [type].concat([].slice.call(arguments)));
					};
				}
			}.call(this, type);
		}
	};
	UploadEvents.prototype = {
		/**
		* @private
		*/
		__initEvent: function(type, handles, thisObj){
			if(!(type in this._.events)){
				this._.events[type] = new Event(type, this._.thisObj);
			}
			
			var cfg = {
				handles: handles,
				thisObj: thisObj
			};
			
			return cfg;
		},
		/**
		* bind event
		* @param {String} type event type
		* @param {Function|Function[]} handles event handles
		* @param [thisObj]
		* @param [args,..]
		*/
		on: function(type, handles, thisObj, args){
			var cfg = this.__initEvent(type, handles, thisObj);
			this._.events[type].add.apply(this._.events[type], [cfg].concat([].slice.call(arguments, 3)));
		},
		/**
		* remove event
		* @param {String} type event type
		* @param {Function|Function[]} [handles] remove handles
		*/
		off: function(type, handles){
			if(type in this._.events){
				this._.events[type].remove(handles);
			}
		},
		/**
		* bind once excuted event
		* @param {String} type event type
		* @param {Function|Function[]} handles event handles
		* @param [thisObj]
		* @param [args,..]
		*/
		one: function(type, handles, thisObj, args){
			var cfg = this.__initEvent(type, handles, thisObj);
			this._.events[type].one.apply(this._.events[type], [cfg].concat([].slice.call(arguments, 3)));
		},
		/**
		* trigger some event with the type
		* @param {String} type event type
		* @param [args,..]
		*/
		fire: function(type, args){
			if(type in this._.events){
				this._.events[type].exec.apply(this._.events[type], [].slice.call(arguments, 1));
			}
		},
		/**
		* set this object in all event handle excution context
		* @param thisObj
		*/
		bindThisObj: function(thisObj){
			this._.thisObj = thisObj;
			for(var type in this._.events){
				this._.events[type].bindThisObj(thisObj);
			}
		}
	};
	
	plugs.UploadEvents = UploadEvents;
	//<!-- Upload Events END -->
	
}.call(FOCUS, window, window.document);
/**
* @requires UploadEvents
*/
;void function(){
	var plugs = this.namespace('FOCUS.widget.Upload.plugins');
	
	plugs.AutoDisabled = function(mode){
		this.on('uploadStart', function(){
			this.turn('off');
		}).on('uploadSuccess', function(){
			this.turn('on');
		}).on('uploadError', function(){
			this.turn('on');
		});
	};
}.call(FOCUS);
/* global FOCUS, lrz */

;void function(){
	var plugs = this.namespace('FOCUS.widget.Upload.plugins');
	var UPLOAD_ERROR = FOCUS.widget.Upload.UPLOAD_ERROR;
	var util = FOCUS.util;

	// 压缩图片失败
	UPLOAD_ERROR.ZIP_ERROR = "-320";

	var cache = document.createElement("div");
	cache.style.cssText = "width:1px; height:1px; overflow:hidden; position:absolute; top: -10px; left: -10px;";

	var getImgSize = function(file, callback, fail){
		document.body.appendChild(cache);

		var reader = new FileReader();
		reader.onload = function(){
			var img = new Image();
			
			img.onload = function(){
				(typeof callback === "function") && callback(this.naturalWidth || this.width, this.naturalHeight || this.height);
				img.onload = img.onerror = null;
				cache.removeChild(img);
			};

			img.onerror = function(){
				(typeof fail === "function") && fail("Cannot read this image file.");
				img.onload = img.onerror = null;
				cache.removeChild(img);
			};

			img.src = this.result;
			cache.appendChild(img);
		};
		
	
		reader.readAsDataURL(file);
	};

	// 压缩宽高、quality
	var resize = function(file, width, height, quality){
		width = width || null;
		height = height || null;

		var config = {
			width: width,
			height: height
		};

		quality = quality || 0.85;

		if(quality){
			config.quality = quality;
		}

		return lrz(file, config);
	};

	/**
	 * @param m 系数
	 */
	var computeSize = function(naturalWidth, naturalHeight, fileSize, targetSize, m){
		/**
		 * 压缩算法
		 * 
		 * 1. 假定一次压缩能达到要求的像素数比 与 体积比 大约相等
		 * 2. 根据等式1，换算出目标像素数量
		 * 3. 根据原图宽高比例 及 目标像素数量，算出宽度
		 * 4. 返回宽度的 m 系数倍取整的值，作为宽度
		 */

		m = m || 1;

		var scale = fileSize / targetSize;
		var pixel = naturalWidth * naturalHeight / scale;
		var whScale = naturalWidth / naturalHeight;
		var tw = Math.sqrt(pixel * whScale);

		return {
			width: parseInt(tw * m),
			height: null
		}
	};

	// 压缩文件尺寸
	var sizeZip = function(file, size, quality, callback, fail){
		var currSize = file.size;
		var tarSize = size;
		var m = 1.3;
		var times = 0;

		switch(file.type){
			case "image/png": m = 2.2; break;
			case "image/jpeg": m = 1.3; break;
			default: m = 1.8;
		}

		var check = function(result, width, height){
			var me = arguments.callee;

			if(result.fileLen <= tarSize){
				callback(result, times);
			}else{
				times++;
				// 如果尺寸不够，则按照当前压缩出来的尺寸与目标尺寸的比值，折算 m 系数
				m = (m / (result.fileLen / tarSize)).toFixed(2);

				var wh = computeSize(width, height, currSize, tarSize, m);
				resize(file.data, wh.width, wh.height, quality).then(function(result){
					me(result, width, height);
				})["catch"](fail);
			}
		};

		getImgSize(file.data, function(width, height){
			times++;
			var wh = computeSize(width, height, currSize, tarSize, m);
			resize(file.data, wh.width, wh.height).then(function(result){
				check(result, width, height);
			})["catch"](fail);
		}, fail);
	};
	
	plugs.zip = function(mode){
		if(mode !== "html5" || typeof lrz === "undefined"){
			return this;
		}

		var _startUpload = this.startUpload;

		this.startUpload = function(){
			var _this = this;
			var doZip = !!this.cfg.zip;
			var zipConfig = this.cfg.zip;
			var file = this.getQueueFile();
			if(!file){
				return this;
			}

			var canZip = /^image\//.test(file.type);
			var zipType;

			if(doZip && canZip){
				var done = function(result, times){
					times = times || 1;
					file.data = result.file;
					file.suffix = "jpg";
					file.fullname = file.name + "." + file.suffix;
					file.type = "image/jpeg";
					file.size = result.fileLen;

					_this.fire("zipSuccess", file, times, zipType);
					_this.fire("zipComplete", file, zipType);
					_startUpload.apply(_this, [].slice.call(arguments));
				};

				var fail = function(err){
					_this.dequeue(false);
					_this.fire("zipError", file, err || "zip error", zipType);
					_this.fire("uploadError", file, UPLOAD_ERROR.ZIP_ERROR, err || "zip error", zipType);
					_this.fire("zipComplete", file, zipType);
					_this.fire("uploadComplete", file);
				};
				
				
				if(zipConfig.size){	// 压缩文件尺寸
					var size = util.sizeConvert.unit2Bytes(zipConfig.size);

					if(file.size > size){	// 仅在文件超出尺寸才压缩
						zipType = "filesize";
						_this.fire("zipStart", file, zipType);

						setTimeout(function(){
							sizeZip(file, size, zipConfig.quality, done, fail);
						}, 0);
					}else{
						_startUpload.apply(this, [].slice.call(arguments));
					}
				}else if(zipConfig.width || zipConfig.height){	// 压缩文件宽高、质量
					zipType = "size";
					_this.fire("zipStart", file, zipType);

					setTimeout(function(){
						resize(file.data, zipConfig.width, zipConfig.height, zipConfig.quality)
							.then(done)["catch"](fail);
					}, 0);
				}
			}else{
				_startUpload.apply(this, [].slice.call(arguments));
			}

			return this;
		};
	};

}.call(FOCUS);
;void function(window, document, undefined){
	var THAT = this;
	var util = this.util;
	var upload = this.widget.Upload;
	var plugs = upload.plugins;
	var MODE = upload.MODE;
	var UUID = this.UUID;
	var PATH_CHARSET = this.PATH_CHARSET;
	
	plugs.Patch4Charset = function(mode){
		if(mode === MODE.HTML5 && swfobject && util.flash.has && window.FormData && window.FormData.customized){
			var id = "FOCUS_UPLOAD_PATCH_CHARSET_" + UUID;
			if(swfobject.getObjectById(id)){
				return;
			}
			
			var div = document.createElement('div');
			div.style.cssText = ';position:absolute; top:0; right:2px; float:none; display:block; width:1px; height:1px; margin:0; padding:0; border:0 none; font-size:0; line-height:0; background-color:transparent;';
			var span = document.createElement('span');
			span.id = id
			
			document.body.appendChild(div);
			div.appendChild(span);
			
			swfobject.embedSWF(this.cfg.pathCharset || THAT.PATH_CHARSET || THAT.BASEPATH + 'widget/upload/html5/transformCharset/transformCharset.swf', span.id, 1, 1, '9.0.0', null, null, null, null, function(){
				var timer = window.setInterval(function(){
					var swf = swfobject.getObjectById(span.id);
					if(swf){
						window.clearInterval(timer);
						util.transformCharset = function(str, charset){
							charset = charset || 'UTF-8';
							
							return swf.transformCharset(str, charset);
						};
					}else{ }
				}, 25);
			});
		}
	};
	
}.call(FOCUS, this, document);
;void function(window, document, undefined){
	var io = this.namespace('FOCUS.widget.io.iframe');
	var noop = function(){};
	
	var util = this.util;
	
	//elems generator
	var createElem = util.createElement;

	//formdata
	var IO_FormData = function(context){
		this.context = context;
		this.elems = {};
	};
	IO_FormData.prototype = {
		_: {
			/*form: function(url){
				return createElem({
					el: 'form',
					name: 'FOCUS_UPLOAD_FORM_' + FOCUS.util.random(0, 1000),
					method: 'POST',
					enctype: 'multipart/form-data',
					action: url || ''
				});
			},*/
			text: function(name, txt, context){
				return createElem({
					el: 'textarea',
					name: name,
					value: txt + ''
				}, context);
			},
			radio: function(name, value, checked, context){
				return createElem({
					el: 'input',
					type: 'radio',
					name: name,
					value: value,
					checked: !!checked
				}, context);
			},
			checkbox: function(name, value, checked, context){
				return createElem({
					el: 'input',
					type: 'checkbox',
					name: name,
					value: value,
					checked: !!checked
				}, context);
			},
			file: function(inputFileElem, cfg, context){
				if(inputFileElem){
					var file = inputFileElem;//.cloneNode(true);
					cfg && cfg.name && (file.name = cfg.name);
					return file;
				}else{
					var _cfg = {
						el: 'input',
						type: 'file'
					};
					
					util.extend(true, _cfg, cfg);

					return createElem(_cfg, context);
				}
			},
			clone: function(elem){
				return elem.cloneNode(true);
			}
		},
		append: function(name, value){
			var type = util.type(value);
			var elem;
			
			if(type !== 'string' && value.type === 'file'){
				elem = this._.file(value, { name: name }, this.context);
			}else if(type === 'string'){
				elem = this._.text(name, value + '', this.context);
			}
			
			this.elems[name] = elem;
			//this.elems.__submit_form.appendChild(elem); //in ie6, here will leak the memory
		}
	};
	
	//
	io.IO_FormData = IO_FormData;
}.call(FOCUS, window, document);
;void function(window, document, undefined){
	var io = this.namespace('FOCUS.widget.io.iframe');
	var noop = function(){};
	var util = this.util;
	//elems generator
	var createElem = util.createElement;
	
	//io
	var IO_Iframe = function(cfg, context){
		this.context = context;

		this.cfg = {
			events: {
				load: noop,
				error: noop
			},
			timeout: 100000,
			charset: 'UTF-8',
			dataKey: "__UPLOAD_RESPONSE_DATA__"
		};
		
		util.extend(true, this.cfg, cfg);
		this.elems = {};
		this._ = {};
		
		this.init();
	};
	IO_Iframe.prototype = {
		init: function(){
			var _this = this;

			this.elems.io = createElem({
				el: 'iframe',
				name: 'FOCUS_UPLOAD_IO_' + util.random(0, 1000),
				src: util.browser.msie
					? ('javascript:document.open();' + (document.domain === window.location.hostname
						? ''
						: ('document.domain=\'' + document.domain + '\';')) + 'void(0)')
					: 'about:blank'
				//src: 'javascript:document.open();document.domain="' + document.domain + '";void(0)'
			});
			
			this.elems.io.style.cssText = 'position:absolute; width:1px; height:1px; top: -9999px; left:-9999px;';

			document.body.appendChild(_this.elems.io);

			setTimeout(function(){
				_this.elems.win = _this.elems.io.contentWindow;
				_this.elems.doc = _this.elems.io.contentWindow.document;
			}, 25);
			
			//onload & onerror
			this._.timer = -1;
			this._.handle = {
				load: function(){
					if(_this._.submited){
						clearTimeout(_this._.timer);
						var data = _this._.handle.getData(_this.elems.io);
						if(util.type(data) === 'undefined'){
							_this.cfg.events.error.call(this, 'IO_ERROR');
						}else{
							_this.cfg.events.load.call(this, data);
						}
						_this._.submited = false;
						
						setTimeout(function(){
							_this._deleteForm();
						}, 25);
					}
				},
				error: function(){
					_this.cfg.events.error.call(this);
					_this._.submited = false;
				},
				//default getData, when Xdomain, override it
				getData: function(ifr){
					var data;
					try{
						//[Problem in chrome]
						// if cross domain, try...catch.. could not catch the 'unsafe error' tip
						var win = ifr.contentWindow;
						var doc = win.document;
						var body = doc.body;
						
						data = win[_this.cfg.dataKey || "__UPLOAD_RESPONSE_DATA__"] || _this.__cleanData(body.innerHTML);
					}catch(ex){}
					
					return data;
				}
			};
			
			//bind load event
			this.elems.io.attachEvent
				? this.elems.io.attachEvent('onload', this._.handle.load)
				: (this.elems.io.onload = this._.handle.load);
		},	
		open: function(method, url/*, async*/){
			this._.openCfg = {
				method: method.toUpperCase() === 'GET' ? 'GET' : 'POST',
				action: url
			};
		},
		send: function(data, charset){
			var _this = this;
			setTimeout(function(){
				var ie67 = util.browser.msie && (util.browser.version == 6 || util.browser.version == 7);

				var formCfg = {
					el: 'form',
					name: 'FOCUS_UPLOAD_FORM_' + util.random(0, 1000),
					method: _this._.openCfg.method,
					/*enctype: 'multipart/form-data',*/
					action: _this._.openCfg.action || ''
				};
				
				//if(ie67){
					formCfg.target = _this.elems.io.name;
				//}
				
				var dataArray = [];
				var hasFile = false;
				var tmpElem;
				for(var key in data.elems){
					tmpElem = data.elems[key];
					if(tmpElem.type === 'file'){
						hasFile = true;
					}
					
					dataArray.push(tmpElem);
				}
				
				formCfg.enctype = hasFile ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
				
				_this._deleteForm();
				var form = _this.elems.__submit_form = createElem(formCfg, _this.context);
				form.style.cssText = 'position:absolute; width:1px; height:1px; top: -9999px; left:-9999px;';
				
				var doc = _this.context || document;//ie67 ? document : _this.elems.doc;
				doc.body.appendChild(form);
				
				while(dataArray.length){
					form.appendChild(dataArray.shift());
				}
				
				charset = charset || _this.cfg.charset || 'UTF-8';
				//<-- [fixed] charset setting will lead form submit with other charset in ie
				//record the original document charset
				var originalCharset;
				util.browser.msie && (originalCharset = doc.charset);
				//-->
				util.browser.msie
					? (doc.charset = charset)
					: (form.acceptCharset = charset);
				
				/*_this._.timer = setTimeout(function(){
					_this._.handle.error.call(_this);
				}, _this.cfg.timeout);*/
				
				setTimeout(function(){
					_this._.submited = true;
					form.submit();
					
					//restore charset
					setTimeout(function(){ //make sure submit action executed
						util.browser.msie && (doc.charset = originalCharset);
					}, 1);
				}, 25);
			}, 100);
		},
		onload: function(fn){
			//this.event.bind('load', function(){});
			this.cfg.events.load = fn;
		},
		onerror: function(fn){
			this.cfg.events.error = fn;
		},
		overrideGetData: function(fn){
			this._.handle.getData = fn;
		},
		setUrl: function(url){
			this.elems.__submit_form.action = url;
		},
		_deleteForm: function(){
			try{
				if(this.elems.__submit_form){
					this.elems.__submit_form.parentNode.removeChild(this.elems.__submit_form);
				}
			}catch(ex){}
			
			delete this.elems.__submit_form;
		},
		_deleteIO: function(){
			try{
				if(this.elems.io){
					this.__removeOnloadEvent();
					this.elems.io.parentNode.removeChild(this.elems.io);
				}
			}catch(ex){}
			
			delete this.elems.doc;
			delete this.elems.win;
			delete this.elems.io;
		},
		dispose: function(){
			this._deleteForm();
			this._deleteIO();
		},
		__removeOnloadEvent: function(){
			if(this.elems.io){
				this.elems.io.detachEvent
					? this.elems.io.detachEvent('onload', this._.handle.load)
					: this.elems.io.onload = noop;
			}
		},
		__cleanData: function(datastr){
			var filters = [
				/<\s*(script|style|div|p|a|table|iframe)[\s\S]*?<\s*\/\s*\1\s*>/gi,
				/<\s*(link|img|input)[\s\S]*?>/gi,
				/(^|)\<\/?pre[^\>]*\>(|$)/gi,
				/<!--.*?-->/gi,
				/^[\s\u00A0]+|[\s\u00A0]+$/g
			];
			
			var data = datastr;
			for(var i = 0; i < filters.length; i++){
				filters[i].exec('');
				data = data.replace(filters[i], '');
			}
			
			return data;
		}
	};
	
	//
	io.IO_Iframe = IO_Iframe;
}.call(FOCUS, window, document);
;void function(window, document, undefined){
	var io = this.namespace('FOCUS.widget.io.iframe');
	var IO_FormData = io.IO_FormData;
	var IO_Iframe = io.IO_Iframe;
	var util = this.util;
	var noop = function(){};

	//poster
	var Poster = function(cfg, context){
		this.context = context;
		
		this.cfg = {
			events: {
				//abort: noop,
				error: noop,
				load: noop,
				progress: noop,
				abort: noop
			},
			progressURL: '',
			charset: 'UTF-8',
			timeout: 100000,
			dataKey: "__UPLOAD_RESPONSE_DATA__"
		};
		this._ = {
			cancel: false,
			timeout: false,
			loaded: false,
			timeoutTimer: -1
		};
		this.elems = {};		
		this.set(cfg);
		
		this.init();
	};
	Poster.prototype = {
		init: function(){
			var _this = this;
			this._.getProgress = function(){
				var me = arguments.callee;

				if(_this.cfg.progressURL && !_this._.loaded){
					_this.elems.io_progress = new IO_Iframe();
					//getData result: {loaded: xx, total: xx}
					_this.elems.io_progress.onload(function(data){
						setTimeout(function(){
							_this.elems.io_progress.dispose();
						}, 25);
						if(!_this._.loaded){
							data = util.JSON.parse(data);
							_this.cfg.events.progress.call(data);
							
							setTimeout(function(){
								me();
							}, 100);
						}
					});
					
					_this.elems.io_progress.open('GET', _this.cfg.progressURL, true);
					var data = new IO_FormData();
					data.append('progress', 'loaded');
					_this.elems.io_progress.send(data);
				}
			};
		},
		send: function(data){
			/*var formData = new IO_FormData;
			
			if(data){
				var type = FOCUS.util.type(data);
				var name;
				
				if(type === 'object'){
					for(var key in data){
						name = 'FOCUS_DATA_' + key + FOCUS.util.random(0, 1000);
						formData.append(name, data[key]);
					}
				}else{
					name = 'FOCUS_DATA_' + FOCUS.util.random(0, 1000);
					formData.append(name, data);
				}
			}*/
			
			if(this._.cancel){
				return;
			}
			
			var _this = this;
			this._.timeoutTimer = setTimeout(function(){ //timeout trigger
				_this.timeout();
			}, this.cfg.timeout);
			
			this.elems.io.send(data, this.cfg.charset);
			setTimeout(function(){//adjust the progress event trigger timing
				if(!_this._.cancel){
					_this.cfg.events.progress.call(_this, {loaded: 0, total: 100});
				}
			}, 1);

			this._.getProgress();
		},
		open: function(method, url/*, async*/){
			this._.fullProgress = false;
			this.reset();
			this.elems.io.open(method, url/*, async*/);
		},
		set: function(cfg){
			util.extend(true, this.cfg, cfg);
		},
		reset: function(){
			var _this = this;
			
			if(this.elems.io){
				this.elems.io.dispose();
			}
			
			if(this.elems.io_progress){
				this.elems.io_progress.dispose();
			}
			
			this.elems.io = new IO_Iframe({
				timeout: this.cfg.timeout,
				dataKey: this.cfg.dataKey
			}, this.context);
			
			this.elems.io.onload(function(data){
				if(_this._.timeout){
					return;
				}
				
				if(!_this._.fullProgress){
					_this.cfg.events.progress.call(_this, {loaded: 100, total: 100});
					_this._.fullProgress = true;
				}
				
				clearTimeout(_this._.timeoutTimer);
				
				if(!_this._.cancel){ // not canceled
					_this._.loaded = true;
					_this.cfg.events.load.call(_this, data, this);
				}else{
					//_this.cfg.events.error.call(_this, data, this);
				}
			});
			
			this.elems.io.onerror(function(msg){
				clearTimeout(_this._.timeoutTimer);
				if(!_this._.cancel){ // not canceled
					_this.cfg.events.error.call(_this, this, msg);
				}else{
					//TODO
				}
			});
			
			this._.cancel =  false;
			this._.timeout = false;
			this._.loaded = false;
			this._.timeoutTimer = -1;
		},
		dispose: function(){
			if(this.elems.io){
				this.elems.io.dispose();
				delete this.elems.io;
			}
			
			if(this.elems.io_progress){
				this.elems.io_progress.dispose();
				delete this.elems.io_progress;
			}

			//TODO
		},
		timeout: function(){
			this._.timeout = true;
			this.elems.io.__removeOnloadEvent();
			this.cfg.events.error.call(this, this, 'timeout');
		},
		abort: function(){
			this._.cancel = true;
			clearTimeout(this._.timeoutTimer);
			this.elems.io && this.elems.io.__removeOnloadEvent();
			
			this.cfg.events.abort();
		}
	};
	
	//
	io.Poster = Poster;
}.call(FOCUS, window, document);
;void function(window, document, undefined){
	var noop = function(){};
	
	var util = this.util;
	var widget = this.widget;
	var upload = widget.Upload;
	var MODE = upload.MODE;
	var UPLOAD_ERROR = upload.UPLOAD_ERROR;
	var FILE_STATUS = upload.FILE_STATUS;
	var QUEUE_ERROR = upload.QUEUE_ERROR;
	
	var createElem = util.createElement;
	var IO = widget.io.iframe;
	var Poster = IO.Poster;
	var IO_FormData = IO.IO_FormData;

	///////
	widget.Upload_Iframe = function(cfg){
		this.constructor = arguments.callee;
		this.mode = MODE.IFRAME;
		
		this.elems = {};
		this.cfg = {
			//priority: FOCUS.widget.Upload.PRIORITY.DEFAULT,
			events: {
				ready: noop,
				loadFailed: noop,
				dialogStart: noop,
				dialogComplete: noop,
				queued: noop,
				queueError: noop,
				uploadStart: noop,
				uploadProgress: noop,
				uploadSuccess: noop,
				uploadError: noop,
				uploadComplete: noop
			},
			button: {
				text: 'Upload'
			},
			// single or multi file(s) selection dialog
			// except: some browser such as ie6-9 not support multiple on input:file
			multiple: true,
			sizeLimit: -1,
			queueLimit: -1,
			fileTypes: upload.MIME_TYPE.ALL,
			fileTypesDescription: 'All Files',
			uploadURL: '',
			filePostName: '',
			placeholder: '#uploader',
			charset: upload.CHARSET.DEFAULT,
			allowOpen: false,	// iframe 模式特有参数，允许IE浏览器使用 open 方法
			debug: false,
			timeout: 600000,
			dataKey: "__UPLOAD_RESPONSE_DATA__"
		};
		
		this._ = {
			queue: [],
			uploadingFile: null,
			uploadedFile: [],
			status: upload.TURNING.ON
		};
	
		this.set(cfg);
		this.init();
	};
	
	widget.Upload_Iframe.prototype = new FOCUS.widget.UploadBase();
	util.extend(true, widget.Upload_Iframe.prototype, {
		_init: function(win, doc){
			var _this = this;

			this.elems.holder = createElem({
				el: 'div'
			});

			this.elems.holder.style.cssText = '';
			
			//validate errors
			var validate_errors = {
				missing_url: [UPLOAD_ERROR.MISSING_UPLOAD_URL, 'missing upload URL.'],
				invalid_filetype: [QUEUE_ERROR.INVALID_FILETYPE, 'File is not an allowed file type.'],
				size_limit: [QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT, 'File size exceeds allowed limit.'],
				chain_error: [QUEUE_ERROR.CHAIN_ERROR, 'Some reason to occured chain error.']
			};

			//events
			util.extend(this._, {
				open: function(file){
					var data = new IO_FormData(doc);
					if(util.type(_this.cfg.postParams) === 'object'){
						for(var key in _this.cfg.postParams){
							data.append(key, _this.cfg.postParams[key]);
						}
					}
					
					data.append(_this.cfg.filePostName || file.id, file.data);
					_this.elems.poster.open('POST', _this.cfg.uploadURL, true);
					
					return data;
				},
				post: function(data){
					//setTimeout(function(){
						_this.elems.poster.send(data);
					//}, 1);
				},
				start: function(e){
					var file = _this.getQueueFile();
					if(file){
						if(!_this.cfg.uploadURL || util.type(_this.cfg.uploadURL) !== 'string'){
							_this.cfg.events.uploadError.apply(_this, [file].concat(validate_errors['missing_url']));
							
							_this.stopUpload();
							return;
						}
						
						file.status = FILE_STATUS.IN_PROGRESS;
						_this._.uploadingFile = file;
						_this.cfg.events.uploadStart.call(_this, file);
						var data = _this._.open(file);
						_this._.post(data);
					}
				},
				dialogStart: function(e){
					e = e || win.event;
					e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
					//e.preventDefault ? e.preventDefault() : e.returnValue = false;
					
					_this.cfg.events.dialogStart.call(_this);
				},
				__queued: function(isFromDialog, callback){
					// this: input:file element
					var selected = [], queued = [], total = _this._.queue;
					
					var file = new upload.File(this);
					
					if(this.files && (!util.browser.firefox || (util.browser.firefox && util.browser.version >= 3.6))){ // support html5 files object
						var tmpQueued = [];
						var errorFlag = false;
						var file2valid;
						
						//exceed queue limit
						if(_this.cfg.queueLimit !== -1 && (this.files.length + _this._.queue.length) > _this.cfg.queueLimit){
							for(var i = 0, len = this.files.length; i < len; i++){
								file2valid = new upload.File(this.files[i]);
								selected.push(file2valid);
								
								_this.cfg.events.queueError.call(_this, file2valid, QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED, _this.cfg.queueLimit);
							}
							
							errorFlag = true;
						}else{
							var sizeLimit = util.sizeConvert.unit2Bytes(_this.cfg.sizeLimit);
							
							// validate
							for(var i = 0, len = this.files.length; i < len; i++){
								file2valid = new upload.File(this.files[i]);
								selected.push(file2valid);

								var error;
								//filetype
								if(!util.mimeValidation(_this.cfg.fileTypes, file2valid.type)){
									error = validate_errors['invalid_filetype'];
								}else if(sizeLimit !== -1 && (file2valid.fileSize || file2valid.size) > sizeLimit){ //filesize
									error = validate_errors['size_limit'];
								}
								
								if(!error){
									tmpQueued.push(file2valid);
								}else{
									_this.cfg.events.queueError.apply(_this, [file2valid].concat(error));
									errorFlag = true;
								}
							}
						}
						
						if(errorFlag){
							for(var i = 0, len = tmpQueued.length; i < len; i++){
								tmpQueued[i].id = file.id;
								_this.cfg.events.queueError.apply(_this, [tmpQueued[i]].concat(validate_errors['chain_error']));
							}
						}else{
							for(var i = 0, len = tmpQueued.length; i < len; i++){
								tmpQueued[i].status = FILE_STATUS.QUEUED;
								tmpQueued[i].id = file.id;
								_this.cfg.events.queued.call(_this, tmpQueued[i]);
							}
							
							queued = queued.concat(tmpQueued);
							total.push(file);
						}
						
						delete tmpQueued;
					}else{ // normal input:file -- html4
						selected.push(file);
						
						if(FOCUS.util.mimeValidation(_this.cfg.fileTypes, file.type)){
							queued.push(file);
							total.push(file);
							file.status = FILE_STATUS.QUEUED;
							_this.cfg.events.queued.call(_this, file);
						}else{
							_this.cfg.events.queueError.apply(_this, [file].concat(validate_errors['invalid_filetype']));
						}
					}

					if(isFromDialog){
						_this.elems.selector.parentNode.removeChild(_this.elems.selector);
						_this.elems.selector = _this._._crateSelector((doc && doc.body) || _this.elems.holder, _this._.dialogStart, _this._.dialogComplete);
						
						//_this.elems.resetForm.reset();
						// total.length: total means all in queue, but in iframe method upload, only 1 append to total in one selected file
						//_this.cfg.events.dialogComplete.call(_this, selected.length, queued.length, total.length);
					}
					
					//excute callback
					if(FOCUS.util.type(callback) === 'function'){
						callback.call(_this, selected.length, queued.length, total.length);
					}
					
					delete selected;
					delete queued;
					delete total;
				},
				dialogComplete: function(e){
					e = e || win.event;
					e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
					
					_this._.__queued.call(this, true, _this.cfg.events.dialogComplete);
				},
				uploadProgress: function(e){
					var file = _this.getQueueFile();
					if(file){
						file.status = FILE_STATUS.IN_PROGRESS;
						if(e.loaded === e.total){ //markup the 100 percent in uploading
							file.fullProgress = true;
						}
						
						_this.cfg.events.uploadProgress.call(_this, file, e.loaded, e.total);
					}
				},
				uploadSuccess: function(data, context){
					var poster = _this.elems.poster;
					var file = _this.getQueueFile();
					if(file){
						_this.cfg.events.uploadSuccess.call(_this, file, data, poster);
					}
				},
				uploadError: function(context, msg){
					msg = (msg || '').toUpperCase();
					
					var file = _this.getQueueFile();
					if(file){
						file.status = FILE_STATUS.ERROR;
						_this.cfg.events.uploadError.call(_this, file, UPLOAD_ERROR[msg ? msg : 'UPLOAD_FAILED'], msg ? msg : 'TIMEOUT');
						
						_this._.uploadComplete(true);
					}
				},
				uploadComplete: function(fail, isStop){
					var file = _this.getQueueFile();
				
					if(file){
						if(!fail && !file.fullProgress && !isStop){
							_this._.uploadProgress.call(_this, { loaded: file.size, total: file.size });
							file.fullProgress = true;
						}
						
						if(!isStop){
							file.status = FILE_STATUS.COMPLETE;
						}
						
						_this._.queue.shift();
						_this._.uploadingFile = null;
						
						_this.cfg.events.uploadComplete.call(_this, file);
						
						//if(!isStop){
							//_this._.start();
						//}
					
					}
				},
				complete: function(data, context){
					_this._.uploadSuccess.call(_this, data, context);
					_this._.uploadComplete.call(_this);
					
					//In IE, no dispose, it will refuse access iframe when F5 refresh
					setTimeout(function(){
						//for firefox, at this the iframe loaded time,
						//there is a loading progress bar always in firefox that destroy the iframe straightway.
						//use timer to restore it
						if(_this.elems.poster){
							_this.elems.poster.dispose();
							delete _this.elems.poster;
						}
					}, 25);
				},
				abort: function(){
					// be sure uploadComplete after uploadStart event, when upload cancelled
					setTimeout(function(){
						_this._.uploadComplete(false, true);
					}, 1);
				},
				_crateSelector: function(wrap, dialogStart, dialogComplete){
					var doc;
					
					if(_this.cfg.allowOpen){
						doc = _this.elems.openFrame.contentWindow.document;
						wrap = doc.body;
					}

					var selector = createElem({
						el: 'input',
						type: 'file',
						name: 'FOCUS_FILE_' + util.random(0, 100),
						//'class': FOCUS.widget.Upload.CSS.SELECTOR,
						multiple: !!_this.cfg.multiple//,
						//accept: FOCUS.util.browser.chrome ? '*/*' : _this.cfg.fileTypes
					}, doc);
					
					wrap.appendChild(selector);
					util.event.bind(selector, 'click', dialogStart);
					util.event.bind(selector, 'change', dialogComplete);

					_this.__setStyle('iframe', _this.elems.holder, selector, _this.cfg.button.text);
					
					return selector;
				}
			});
			
			
			//holder
			var place = util.query
				? util.query(this.cfg.placeholder)
				: document.getElementById(this.cfg.placeholder.replace(/^#/, ''));
				
			if(place){
				if('length' in place){
					place = place[0];
				}
				
				if(place){
					place.parentNode.insertBefore(_this.elems.holder, place);
					//this.elems.holder.appendChild(this.elems.resetForm);
					_this.elems.selector = _this._._crateSelector((doc && doc.body) || _this.elems.holder, _this._.dialogStart, _this._.dialogComplete);
					place.parentNode.removeChild(place);

					if(_this.cfg.allowOpen){
						util.event.bind(_this.elems.holder, "click", function(){
							_this.open();
						});
					}
				}
			}

			setTimeout(function(){
				_this.isReady = true;
				// callback for choose which type to initialize
				_this.cfg.events.ready.call(_this, _this.mode);
			}, 25);
		},
		init: function(){
			var _this = this;
			var win = window;
			var doc;

			if(this.cfg.allowOpen){	// 允许ie使用open方法
				this._createOpenFrame(function(){
					win = _this.elems.openFrame.contentWindow;
					doc = win.document;

					_this._init(win, doc);
				});
			}else{
				this._init(win, doc);
			}
			
		},
		startUpload: function(){
			if(this.elems.poster){
				this.elems.poster.dispose();
			}
			
			var doc;

			try{
				doc = this.elems.openFrame.contentWindow.document;
			}catch(ex){}

			this.elems.poster = new Poster({
				events: {
					abort: this._.abort,
					load: this._.complete,
					error: this._.uploadError,
					progress: this._.uploadProgress
				},
				progressURL: this.cfg.progressURL,
				charset: this.cfg.charset,
				timeout: this.cfg.timeout || 100000,
				dataKey: this.cfg.dataKey
			}, doc);
			
			this._.start();
			
			return this;
		},
		/**
		* queue files
		* @param {FileInput|FileInput[]} files
		* @param {Function} [callback] queue completed callback
		*/
		queue: function(files, callback){
			if(!files){
				return;
			}
			
			if(files.length === undefined){
				files = [files];
			}
			
			for(var i = 0; i < files.length; i++){
				this._.__queued.call(files[i], false, callback);
			}
			
			return this;
		},
		_createOpenFrame: function(callback){
			var _this = this;

			var frame = this.elems.openFrame = createElem({
				el: 'iframe',
				name: 'FOCUS_UPLOAD_OPEN_' + util.random(0, 1000),
				src: util.browser.msie
					? ('javascript:document.open();' + (document.domain === window.location.hostname
						? ''
						: ('document.domain=\'' + document.domain + '\';')) + 'document.close(); void(0);')
					: 'about:blank'
				//src: 'javascript:document.open();document.domain="' + document.domain + '";void(0)'
			});
			
			this.elems.openFrame.style.cssText = 'position:absolute; width:1px; height:1px; top: -9999px; left:-9999px;';

			document.body.appendChild(_this.elems.openFrame);

			var doc;

			var timer = setInterval(function(){
				try{
					doc = frame.contentWindow.document;
					clearInterval(timer);

					setTimeout(function(){
						(typeof callback === 'function') && callback();
					}, 25);
				}catch(ex){}
			}, 19);
		}
	});
}.call(FOCUS, this, this.document);

/**
* Known Problems
* 1 in chrome, if cross domain, try...catch.. could not catch the 'unsafe error' tip on access iframe.contentWindow in 'getData' method calling with IO_Iframe object
*/







































;void function(window, document, undefined){
	var noop = function(){};
	var util = this.util;
	var widget = this.widget;
	var upload = widget.Upload;
	var MODE = upload.MODE;
	var UPLOAD_ERROR = upload.UPLOAD_ERROR;
	var FILE_STATUS = upload.FILE_STATUS;
	var QUEUE_ERROR = upload.QUEUE_ERROR;
	
	widget.Upload_HTML5 = function(cfg){
		this.constructor = arguments.callee;
		this.mode = MODE.HTML5;
		
		this.elems = {};
		this.cfg = {
			//priority: FOCUS.widget.Upload.PRIORITY.DEFAULT,
			events: {
				ready: noop,
				loadFailed: noop,
				dialogStart: noop,
				dialogComplete: noop,
				queued: noop,
				queueError: noop,
				uploadStart: noop,
				uploadProgress: noop,
				uploadSuccess: noop,
				uploadError: noop,
				uploadComplete: noop
			},
			button: {
				text: 'Upload'
			},
			// single or multi file(s) selection dialog
			// except: some browser such as ie6-9 not support multiple on input:file
			multiple: true,
			sizeLimit: -1,
			queueLimit: -1,
			fileTypes: upload.MIME_TYPE.ALL,
			fileTypesDescription: 'All Files',
			uploadURL: '',
			filePostName: '',
			placeholder: '#uploader',
			charset: upload.CHARSET.DEFAULT,
			debug: false,
			timeout: 600000
		};
		
		this._ = {
			queue: [],
			uploadingFile: null,
			cancel: false,
			status: upload.TURNING.ON
		};
		
		this.set(cfg);
		this.init();
	};
	
	widget.Upload_HTML5.prototype = new widget.UploadBase();
	util.extend(true, widget.Upload_HTML5.prototype, {
		init: function(){
			var _this = this;
			
			//EVENTS
			this._.start = function(){
				var file = _this.getQueueFile();
				if(file){
					if(!_this.cfg.uploadURL || util.type(_this.cfg.uploadURL) !== 'string'){
						_this.cfg.events.uploadError.call(_this, file, UPLOAD_ERROR.MISSING_UPLOAD_URL, 'missing upload url.');
						
						_this.stopUpload();
						return;
					}
					
					file.status = FILE_STATUS.IN_PROGRESS;
					_this._.uploadingFile = file;
					_this.cfg.events.uploadStart.call(_this, file);
					_this._.post(file);
				}
			};
			
			this._.success = function(e){
				var poster = _this.elems.poster;
				var file = _this.getQueueFile();
				_this.cfg.events.uploadSuccess.call(_this, file, poster.responseText || poster.responseXML, poster);
				//_this._.uploadComplete();
			};
			
			this._.error = function(e, code, msg){
				if(!_this._.cancel){
					var file = _this.getQueueFile();
					if(file){
						file.status = FILE_STATUS.ERROR;
						
						_this.cfg.events.uploadError.call(_this, file, code || UPLOAD_ERROR.UPLOAD_FAILED, msg || '');
						_this._.uploadComplete();
					}
				}
			};
			
			this._.abort = function(e){
				//_this.stopUpload();
				//_this.getQueueFile().status = FOCUS.widget.Upload.FILE_STATUS.CANCELLED;
				
				//_this.cfg.events.uploadError.call(_this, file, FOCUS.widget.Upload.UPLOAD_ERROR.FILE_CANCELLED);
				//_this._.queue.shift();
				//_this._.uploadingFile = null;

				//_this._.start();
				_this._.cancel = true;
				_this._.uploadComplete(true);
			};
			
			this._.progress = function(e){
				var file = _this.getQueueFile();
				if(file){
					if(e.loaded === e.total){ //markup the 100 percent in uploading
						file.fullProgress = true;
					}
					
					_this.cfg.events.uploadProgress.call(_this, file, e.loaded, e.total);
				}
			};
			
			//post handle
			this._.post = function(file){
				//setTimeout(function(){
					_this.elems.poster.open('POST', _this.cfg.uploadURL, true);
					
					var data;
					if(FormData.customized){
						data = new FormData(_this.cfg.charset);
					}else{
						data = new FormData();
					}

					if(util.type(_this.cfg.postParams) === 'object'){
						for(var key in _this.cfg.postParams){
							data.append(key, _this.cfg.postParams[key]);
						}
					}
					
					data.append(_this.cfg.filePostName || file.id, file.data);
					
					if(util.feature_upload.html5.FormData){
						_this.elems.poster.send(data);
					}else{
						_this.elems.poster.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
						_this.elems.poster.sendAsBinary(data);
					}
				//}, 1);
			};
			
			//uploadComplete
			this._.uploadComplete = function(isStop){
				var file = _this.getQueueFile();
				
				if(file){
					if(!file.fullProgress){
						_this._.progress.call(_this, { loaded: file.size, total: file.size });
						file.fullProgress = true;
					}
					
					if(!isStop){
						file.status = FILE_STATUS.COMPLETE;
					}
					
					_this._.queue.shift();
					_this._.uploadingFile = null;
					
					_this.cfg.events.uploadComplete.call(_this, file);
					
					//if(!isStop){
						//_this._.start();
					//}
				}
			};
			
			//xhr complete
			this._.xhrComplete = function(e){
				if(this.readyState === 4){
					switch(this.status){
						case 200: {
							_this._.success.call(this, e);
							_this._.uploadComplete();
						}; break;
						case 404:
						case 500: {
							_this._.error.call(this, e, UPLOAD_ERROR.HTTP_ERROR, this.status);
						}; break;
						default:;
					}
				}
			};
			
			//dialog start <== input:file click event
			this._.dialogStart = function(e){
				e = e || window.event;
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				//e.preventDefault ? e.preventDefault() : e.returnValue = false;
				
				_this.cfg.events.dialogStart.call(_this);
			};
			
			//enter the queue
			this._.__queued = function(files, callback){
				var isFromDialog = !files;
				var selected = [], queued = [], total = _this._.queue;
				var file;
				files = files || _this.elems.selector.files;
				selected = [].slice.call(files);
				
				//exceed queue limit
				if(_this.cfg.queueLimit !== -1 && (selected.length + _this._.queue.length) > _this.cfg.queueLimit){
					for(var i = 0, len = selected.length; i < len; i++){
						_this.cfg.events.queueError.call(_this, selected[i], QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED, _this.cfg.queueLimit);
					}
				}else{ // other validations
					for(var i = 0, len = selected.length; i < len; i++){
						file = new upload.File(selected[i]);
						
						file.status = FILE_STATUS.ERROR;

						if(!FOCUS.util.mimeValidation(_this.cfg.fileTypes, file.type)){
							_this.cfg.events.queueError.call(_this, file, QUEUE_ERROR.INVALID_FILETYPE, 'File is not an allowed file type.');
							continue;
						}
						
						//zero size file
						if((file.fileSize || file.size) === 0){
							_this.cfg.events.queueError.call(_this, file, QUEUE_ERROR.ZERO_BYTE_FILE, 'File is zero bytes and cannot be uploaded.');
							continue;
						}
						
						var sizeLimit = util.sizeConvert.unit2Bytes(_this.cfg.sizeLimit);
						//exceed size limit
						if(sizeLimit !== -1 && (file.fileSize || file.size) > sizeLimit){
							_this.cfg.events.queueError.call(_this, file, QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT, 'File size exceeds allowed limit.');
							continue;
						}
						
						file.status = FILE_STATUS.QUEUED;
						
						_this.cfg.events.queued.call(_this, file);
						queued.push(file);
						total.push(file);
					}
				}
				
				if(isFromDialog){
					//_this.elems.resetForm.reset();
					_this._._resetSelector();
					_this.cfg.events.dialogComplete.call(_this, selected.length, queued.length, total.length);
				}else{
					//TODO
					util.type(callback) === 'function' && callback.call(_this, selected.length, queued.length, total.length);
				}
				
				delete selected;
				delete queued;
				delete total;
			};
			
			//dialog complete <== input:file change event
			this._.dialogComplete = function(e, files){
				e = e || window.event;
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				//e.preventDefault ? e.preventDefault() : e.returnValue = false;
				
				_this._.__queued();
			};
			
			//reset the file selector
			this._._resetSelector = function(){
				_this.elems.resetForm.appendChild(_this.elems.selector);
				setTimeout(function(){
					_this.elems.resetForm.reset();
					setTimeout(function(){
						_this.elems.holder.appendChild(_this.elems.selector);
					}, 25);
				},25);
			};
			
			//this.cfg.placeholder
			//holder elem
			this.elems.holder = document.createElement('div');
			this.elems.holder.style.cssText = '';
			this.elems.resetForm = document.createElement('form');
			this.elems.selector = document.createElement('input');
			this.elems.selector.type = 'file';
			this.elems.selector.multiple = util.feature_upload.html5.multiple && this.cfg.multiple;
			this.setFileTypes(this.cfg.fileTypes);
			this.elems.holder.accept = this.cfg.fileTypes;
			
			var place = util.query ? util.query(this.cfg.placeholder) : document.querySelectorAll(this.cfg.placeholder);
			if(place.length){
				place = place[0];
				place.parentNode.insertBefore(this.elems.holder, place);
				//this.elems.holder.appendChild(this.elems.resetForm);
				this.elems.holder.appendChild(this.elems.selector);
				place.parentNode.removeChild(place);
				
				FOCUS.util.event.bind(this.elems.selector, 'click', this._.dialogStart);
				FOCUS.util.event.bind(this.elems.selector, 'change', this._.dialogComplete);
				
				this.__setStyle('html5', this.elems.holder, this.elems.selector, this.cfg.button.text);
			}else{}

			setTimeout(function(){
				_this.isReady = true;
				// callback for choose which type to initialize
				_this.cfg.events.ready.call(_this, _this.mode);
			}, 25);
		},
		//override
		startUpload: function(){
			//gen poster
			this.elems.poster = new XMLHttpRequest();
			//FOCUS.util.event.bind(this.elems.poster.upload, 'load', this._.success);
			util.event.bind(this.elems.poster.upload, 'progress', this._.progress);
			util.event.bind(this.elems.poster.upload, 'error', this._.error);
			util.event.bind(this.elems.poster.upload, 'abort', this._.abort);
			util.event.bind(this.elems.poster, 'readystatechange', this._.xhrComplete);
			
			this._.start();
			
			return this;
		},
		/*cancelUpload: function(){
			var file = this.getQueueFile();
			file.status = FOCUS.widget.Upload.FILE_STATUS.CANCELLED;
			this.cfg.events.uploadError.call(_this, file, FOCUS.widget.Upload.UPLOAD_ERROR.FILE_CANCELLED, 'file cancelled.');
			this.elems.poster && this.elems.poster.abort();
		},
		stopUpload: function(){
			var file = this.getQueueFile();
			file.status = FOCUS.widget.Upload.FILE_STATUS.QUEUED;
			this.cfg.events.uploadError.call(this, file, FOCUS.widget.Upload.UPLOAD_ERROR.UPLOAD_STOPPED, 'upload stopped.');
			this.elems.poster && this.elems.poster.abort();
			this._.queue.unshift(file);
		},*/
		/*setFileTypes: function(mimeTypes){
			this.cfg.fileTypes = this.elems.selector.accept = util.convert2Mimetype(mimeTypes);
		},*/
		/*setFileQueueLimit: function(limit){
			this.cfg.queueLimit = limit;
			this.elems.selector.multiple = limit !== 1;
		},*/
		/**
		* try to queue files
		* only surport for HTML5 edtion
		* @param {HTMLFileInput|HTMLInputElement#FileList|File[]} files
		* @param {Function} [callback] queueCompelete callback
		*/
		queue: function(files, callback){
			if(files.files){ //typeof files === input:file
				files = files.files;
			}
			
			if(!files || !files.length){
				return;
			}
			
			this._.__queued(files, callback);
			
			return this;
		}
	});
}.call(FOCUS, this, this.document);

//// Known Problems
// 1. when use Firefox v > 3.5, < 4, custom class FormData, cannot convert non-ASCII characters to Binary String at FormData.prototype.append method, the parameter 'name' and the 'filename' in data will use UTF-8 URI coding instead.
//   server side developer have to convert the UTF-8 URI coding to normal characters
// [FIXED] use flash to translate chars. but if browser not support flash, also use URI encode
/**
 * SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com
 *
 * mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/
 *
 * SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilz�n and Mammon Media and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * SWFObject v2.2 <http://code.google.com/p/swfobject/> 
 *	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
 */



/* ******************* */
/* Constructor & Init  */
/* ******************* */
var SWFUpload;
var swfobject;

if (SWFUpload == undefined) {
	SWFUpload = function (settings) {
		this.initSWFUpload(settings);
	};
}

;void function(SWFUpload){

var encodeURIComponent = window.encodeURIComponent;
var fupload = this.widget.Upload;
var util = this.util;
var proto = SWFUpload.prototype;

proto.initSWFUpload = function (userSettings) {
	try {
		this.customSettings = {};	// A container where developers can place their own settings associated with this instance.
		this.settings = {};
		this.eventQueue = [];
		this.movieName = "SWFUpload_" + SWFUpload.movieCount++;
		this.movieElement = null;


		// Setup global control tracking
		SWFUpload.instances[this.movieName] = this;

		// Load the settings.  Load the Flash movie.
		this.initSettings(userSettings);
		this.loadSupport();
		if (this.swfuploadPreload()) {
			this.loadFlash();
		}

		this.displayDebugInfo();
	} catch (ex) {
		delete SWFUpload.instances[this.movieName];
		throw ex;
	}
};

/* *************** */
/* Static Members  */
/* *************** */
SWFUpload.instances = {};
SWFUpload.movieCount = 0;
SWFUpload.version = "2.5.0 2010-01-15 Beta 2";

SWFUpload.QUEUE_ERROR = fupload.QUEUE_ERROR;
SWFUpload.UPLOAD_ERROR = fupload.UPLOAD_ERROR;
SWFUpload.FILE_STATUS = fupload.FILE_STATUS;
SWFUpload.BUTTON_ACTION = fupload.BUTTON_ACTION;

SWFUpload.UPLOAD_TYPE = {
	NORMAL       : -1,
	RESIZED      : -2
};

SWFUpload.CURSOR = {
	ARROW : -1,
	HAND  : -2
};
SWFUpload.WINDOW_MODE = {
	WINDOW       : "window",
	TRANSPARENT  : "transparent",
	OPAQUE       : "opaque"
};

SWFUpload.RESIZE_ENCODING = {
	JPEG  : -1,
	PNG   : -2
};

// Private: takes a URL, determines if it is relative and converts to an absolute URL
// using the current site. Only processes the URL if it can, otherwise returns the URL untouched
SWFUpload.completeURL = function (url) {
	try {
		var path = "", indexSlash = -1;
		if (typeof(url) !== "string" || url.match(/^https?:\/\//i) || url.match(/^\//) || url === "") {
			return url;
		}
		
		indexSlash = window.location.pathname.lastIndexOf("/");
		if (indexSlash <= 0) {
			path = "/";
		} else {
			path = window.location.pathname.substr(0, indexSlash) + "/";
		}
		
		return path + url;
	} catch (ex) {
		return url;
	}
};

// Public: assign a new function to onload to use swfobject's domLoad functionality
SWFUpload.onload = function () {};


/* ******************** */
/* Instance Members  */
/* ******************** */

util.extend(true, proto, {
	// Private: initSettings ensures that all the
	// settings are set, getting a default value if one was not assigned.
	initSettings: function (userSettings) {
		var cfg = this.settings;
		
		this.ensureDefault = function (settingName, defaultValue) {
			var setting = userSettings[settingName];
			if (setting != undefined) {
				cfg[settingName] = setting;
			} else {
				cfg[settingName] = defaultValue;
			}
		};
		
		var set = function(o){
			for(var key in o){
				this.ensureDefault(key, o[key]);
			}
		};
		
		set.call(this, {
			// Upload backend settings
			upload_url: '',
			preserve_relative_urls: false,
			file_post_name: 'Filedata',
			post_params: {},
			use_query_string: false,
			requeue_on_error: false,
			http_success: [],
			assume_success_timeout: 0,
		
			// File Settings
			file_types: '*.*',
			file_types_description: 'All Files',
			file_size_limit: 0, // Default zero means "unlimited"
			file_upload_limit: 0,
			file_queue_limit: 0,

			// Flash Settings
			flash_url: 'swfupload.swf',
			flash9_url: 'swfupload_fp9.swf',
			prevent_swf_caching: true,
		
			// Button Settings
			button_image_url: '',
			button_width: 1,
			button_height: 1,
			button_text: '',
			button_text_style: 'color: #000000; font-size: 16pt;',
			button_text_top_padding: 0,
			button_text_left_padding: 0,
			button_action: SWFUpload.BUTTON_ACTION.SELECT_FILES,
			button_disabled: false,
			button_placeholder_id: '',
			button_placeholder: null,
			button_cursor: SWFUpload.CURSOR.ARROW,
			button_window_mode: SWFUpload.WINDOW_MODE.WINDOW
		});
		
		// Debug Settings
		set.call(this, {
			debug: false
		});
		cfg.debug_enabled = cfg.debug;	// Here to maintain v2 API
		
		// Event Handlers
		cfg.return_upload_start_handler = this.returnUploadStart;
		set.call(this, {
			swfupload_preload_handler: null,
			swfupload_load_failed_handler: null,
			swfupload_loaded_handler: null,
			file_dialog_start_handler: null,
			file_queued_handler: null,
			file_queue_error_handler: null,
			file_dialog_complete_handler: null,
			
			upload_resize_start_handler: null,
			upload_start_handler: null,
			upload_progress_handler: null,
			upload_error_handler: null,
			upload_success_handler: null,
			upload_complete_handler: null,
			
			mouse_click_handler: null,
			mouse_out_handler: null,
			mouse_over_handler: null,
			
			debug_handler: this.debugMessage,
			
			custom_settings: {}
		});

		// Other settings
		this.customSettings = cfg.custom_settings;
		
		// Update the flash url if needed
		if (!!cfg.prevent_swf_caching) {
			cfg.flash_url = cfg.flash_url + (cfg.flash_url.indexOf("?") < 0 ? "?" : "&") + "preventswfcaching=" + new Date().getTime();
			cfg.flash9_url = cfg.flash9_url + (cfg.flash9_url.indexOf("?") < 0 ? "?" : "&") + "preventswfcaching=" + new Date().getTime();
		}
		
		if (!cfg.preserve_relative_urls) {
			cfg.upload_url = SWFUpload.completeURL(cfg.upload_url);
			cfg.button_image_url = SWFUpload.completeURL(cfg.button_image_url);
		}
		
		delete this.ensureDefault;
	},
	// Initializes the supported functionality based the Flash Player version, state, and event that occur during initialization
	loadSupport: function () {
		this.support = {
			loading : swfobject.hasFlashPlayerVersion("9.0.28"),
			imageResize : swfobject.hasFlashPlayerVersion("10.0.0")
		};
		
	},
	// Private: loadFlash replaces the button_placeholder element with the flash movie.
	loadFlash: function () {
		var targetElement, tempParent, wrapperType, flashHTML, els;

		if (!this.support.loading) {
			this.queueEvent("swfupload_load_failed_handler", ["Flash Player doesn't support SWFUpload"]);
			return;
		}
		
		// Make sure an element with the ID we are going to use doesn't already exist
		if (document.getElementById(this.movieName) !== null) {
			this.support.loading = false;
			this.queueEvent("swfupload_load_failed_handler", ["Element ID already in use"]);
			return;
		}

		// Get the element where we will be placing the flash movie
		targetElement = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;

		if (targetElement == undefined) {
			this.support.loading = false;
			this.queueEvent("swfupload_load_failed_handler", ["button place holder not found"]);
			return;
		}

		wrapperType = (targetElement.currentStyle && targetElement.currentStyle["display"] || window.getComputedStyle && document.defaultView.getComputedStyle(targetElement, null).getPropertyValue("display")) !== "block" ? "span" : "div";
		
		// Append the container and load the flash
		tempParent = document.createElement(wrapperType);

		flashHTML = this.getFlashHTML();

		try {
			tempParent.innerHTML = flashHTML;	// Using innerHTML is non-standard but the only sensible way to dynamically add Flash in IE (and maybe other browsers)
		} catch (ex) {
			this.support.loading = false;
			this.queueEvent("swfupload_load_failed_handler", ["Exception loading Flash HTML into placeholder"]);
			return;
		}

		// Try to get the movie element immediately
		els = tempParent.getElementsByTagName("object");
		if (!els || els.length > 1 || els.length === 0) {
			this.support.loading = false;
			this.queueEvent("swfupload_load_failed_handler", ["Unable to find movie after adding to DOM"]);
			return;
		} else if (els.length === 1) {
			this.movieElement = els[0];
		}
		
		targetElement.parentNode.replaceChild(tempParent.firstChild, targetElement);

		// Fix IE Flash/Form bug
		if (window[this.movieName] == undefined) {
			window[this.movieName] = this.getMovieElement();
		}
	},
	// Private: getFlashHTML generates the object tag needed to embed the flash in to the document
	getFlashHTML: function (flashVersion) {
		var cfg = this.settings;
		// Flash Satay object syntax: http://www.alistapart.com/articles/flashsatay
		return ['<object id="', this.movieName, '" type="application/x-shockwave-flash" data="', (this.support.imageResize ? cfg.flash_url : cfg.flash9_url), '" width="', cfg.button_width, '" height="', cfg.button_height, '" class="swfupload">',
					'<param name="wmode" value="', cfg.button_window_mode, '" />',
					'<param name="movie" value="', (this.support.imageResize ? cfg.flash_url : cfg.flash9_url), '" />',
					'<param name="quality" value="high" />',
					'<param name="allowScriptAccess" value="always" />',
					'<param name="flashvars" value="' + this.getFlashVars() + '" />',
					'</object>'].join("");
	},
	// Private: getFlashVars builds the parameter string that will be passed
	// to flash in the flashvars param.
	getFlashVars: function () {
		// Build a string from the post param object
		var httpSuccessString, paramString;
		
		paramString = this.buildParamString();
		httpSuccessString = this.settings.http_success.join(",");
		
		var cfg = this.settings;
		// Build the parameter string
		return ["movieName=", encodeURIComponent(this.movieName),
				"&amp;uploadURL=", encodeURIComponent(cfg.upload_url),
				"&amp;useQueryString=", encodeURIComponent(cfg.use_query_string),
				"&amp;requeueOnError=", encodeURIComponent(cfg.requeue_on_error),
				"&amp;httpSuccess=", encodeURIComponent(httpSuccessString),
				"&amp;assumeSuccessTimeout=", encodeURIComponent(cfg.assume_success_timeout),
				"&amp;params=", encodeURIComponent(paramString),
				"&amp;filePostName=", encodeURIComponent(cfg.file_post_name),
				"&amp;fileTypes=", encodeURIComponent(cfg.file_types),
				"&amp;fileTypesDescription=", encodeURIComponent(cfg.file_types_description),
				"&amp;fileSizeLimit=", encodeURIComponent(cfg.file_size_limit),
				"&amp;fileUploadLimit=", encodeURIComponent(cfg.file_upload_limit),
				"&amp;fileQueueLimit=", encodeURIComponent(cfg.file_queue_limit),
				"&amp;debugEnabled=", encodeURIComponent(cfg.debug_enabled),
				"&amp;buttonImageURL=", encodeURIComponent(cfg.button_image_url),
				"&amp;buttonWidth=", encodeURIComponent(cfg.button_width),
				"&amp;buttonHeight=", encodeURIComponent(cfg.button_height),
				"&amp;buttonText=", encodeURIComponent(cfg.button_text),
				"&amp;buttonTextTopPadding=", encodeURIComponent(cfg.button_text_top_padding),
				"&amp;buttonTextLeftPadding=", encodeURIComponent(cfg.button_text_left_padding),
				"&amp;buttonTextStyle=", encodeURIComponent(cfg.button_text_style),
				"&amp;buttonAction=", encodeURIComponent(cfg.button_action),
				"&amp;buttonDisabled=", encodeURIComponent(cfg.button_disabled),
				"&amp;buttonCursor=", encodeURIComponent(cfg.button_cursor)
			].join("");
	},
	// Public: get retrieves the DOM reference to the Flash element added by SWFUpload
	// The element is cached after the first lookup
	getMovieElement: function () {
		if (this.movieElement == undefined) {
			this.movieElement = document.getElementById(this.movieName);
		}

		if (this.movieElement === null) {
			throw "Could not find Flash element";
		}
		
		return this.movieElement;
	},
	// Private: buildParamString takes the name/value pairs in the post_params setting object
	// and joins them up in to a string formatted "name=value&amp;name=value"
	buildParamString: function () {
		var name, postParams, paramStringPairs = [];
		
		postParams = this.settings.post_params; 

		if (typeof(postParams) === "object") {
			for (name in postParams) {
				if (postParams.hasOwnProperty(name)) {
					paramStringPairs.push(encodeURIComponent(name.toString()) + "=" + encodeURIComponent(postParams[name].toString()));
				}
			}
		}

		return paramStringPairs.join("&amp;");
	},
	// Public: Used to remove a SWFUpload instance from the page. This method strives to remove
	// all references to the SWF, and other objects so memory is properly freed.
	// Returns true if everything was destroyed. Returns a false if a failure occurs leaving SWFUpload in an inconsistant state.
	// Credits: Major improvements provided by steffen
	destroy: function () {
		var movieElement;
		
		try {
			// Make sure Flash is done before we try to remove it
			this.cancelUpload(null, false);
			
			movieElement = this.cleanUp();

			// Remove the SWFUpload DOM nodes
			if (movieElement) {
				// Remove the Movie Element from the page
				try {
					movieElement.parentNode.removeChild(movieElement);
				} catch (ex) {}
			}

			// Remove IE form fix reference
			window[this.movieName] = null;

			// Destroy other references
			SWFUpload.instances[this.movieName] = null;
			delete SWFUpload.instances[this.movieName];

			this.movieElement = null;
			this.settings = null;
			this.customSettings = null;
			this.eventQueue = null;
			this.movieName = null;
			
			
			return true;
		} catch (ex2) {
			return false;
		}
	},
	// Public: displayDebugInfo prints out settings and configuration
	// information about this SWFUpload instance.
	// This function (and any references to it) can be deleted when placing
	// SWFUpload in production.
	displayDebugInfo: function () {
		var cfg = this.settings;
		this.debug(
			[
				"---SWFUpload Instance Info---\n",
				"Version: ", SWFUpload.version, "\n",
				"Movie Name: ", this.movieName, "\n",
				"Settings:\n",
				"\t", "upload_url:               ", cfg.upload_url, "\n",
				"\t", "flash_url:                ", cfg.flash_url, "\n",
				"\t", "flash9_url:                ", cfg.flash9_url, "\n",
				"\t", "use_query_string:         ", cfg.use_query_string.toString(), "\n",
				"\t", "requeue_on_error:         ", cfg.requeue_on_error.toString(), "\n",
				"\t", "http_success:             ", cfg.http_success.join(", "), "\n",
				"\t", "assume_success_timeout:   ", cfg.assume_success_timeout, "\n",
				"\t", "file_post_name:           ", cfg.file_post_name, "\n",
				"\t", "post_params:              ", cfg.post_params.toString(), "\n",
				"\t", "file_types:               ", cfg.file_types, "\n",
				"\t", "file_types_description:   ", cfg.file_types_description, "\n",
				"\t", "file_size_limit:          ", cfg.file_size_limit, "\n",
				"\t", "file_upload_limit:        ", cfg.file_upload_limit, "\n",
				"\t", "file_queue_limit:         ", cfg.file_queue_limit, "\n",
				"\t", "debug:                    ", cfg.debug.toString(), "\n",

				"\t", "prevent_swf_caching:      ", cfg.prevent_swf_caching.toString(), "\n",

				"\t", "button_placeholder_id:    ", cfg.button_placeholder_id.toString(), "\n",
				"\t", "button_placeholder:       ", (cfg.button_placeholder ? "Set" : "Not Set"), "\n",
				"\t", "button_image_url:         ", cfg.button_image_url.toString(), "\n",
				"\t", "button_width:             ", cfg.button_width.toString(), "\n",
				"\t", "button_height:            ", cfg.button_height.toString(), "\n",
				"\t", "button_text:              ", cfg.button_text.toString(), "\n",
				"\t", "button_text_style:        ", cfg.button_text_style.toString(), "\n",
				"\t", "button_text_top_padding:  ", cfg.button_text_top_padding.toString(), "\n",
				"\t", "button_text_left_padding: ", cfg.button_text_left_padding.toString(), "\n",
				"\t", "button_action:            ", cfg.button_action.toString(), "\n",
				"\t", "button_cursor:            ", cfg.button_cursor.toString(), "\n",
				"\t", "button_disabled:          ", cfg.button_disabled.toString(), "\n",

				"\t", "custom_settings:          ", cfg.custom_settings.toString(), "\n",
				"Event Handlers:\n",
				"\t", "swfupload_preload_handler assigned:  ", (typeof cfg.swfupload_preload_handler === "function").toString(), "\n",
				"\t", "swfupload_load_failed_handler assigned:  ", (typeof cfg.swfupload_load_failed_handler === "function").toString(), "\n",
				"\t", "swfupload_loaded_handler assigned:  ", (typeof cfg.swfupload_loaded_handler === "function").toString(), "\n",
				"\t", "mouse_click_handler assigned:       ", (typeof cfg.mouse_click_handler === "function").toString(), "\n",
				"\t", "mouse_over_handler assigned:        ", (typeof cfg.mouse_over_handler === "function").toString(), "\n",
				"\t", "mouse_out_handler assigned:         ", (typeof cfg.mouse_out_handler === "function").toString(), "\n",
				"\t", "file_dialog_start_handler assigned: ", (typeof cfg.file_dialog_start_handler === "function").toString(), "\n",
				"\t", "file_queued_handler assigned:       ", (typeof cfg.file_queued_handler === "function").toString(), "\n",
				"\t", "file_queue_error_handler assigned:  ", (typeof cfg.file_queue_error_handler === "function").toString(), "\n",
				"\t", "upload_resize_start_handler assigned:      ", (typeof cfg.upload_resize_start_handler === "function").toString(), "\n",
				"\t", "upload_start_handler assigned:      ", (typeof cfg.upload_start_handler === "function").toString(), "\n",
				"\t", "upload_progress_handler assigned:   ", (typeof cfg.upload_progress_handler === "function").toString(), "\n",
				"\t", "upload_error_handler assigned:      ", (typeof cfg.upload_error_handler === "function").toString(), "\n",
				"\t", "upload_success_handler assigned:    ", (typeof cfg.upload_success_handler === "function").toString(), "\n",
				"\t", "upload_complete_handler assigned:   ", (typeof cfg.upload_complete_handler === "function").toString(), "\n",
				"\t", "debug_handler assigned:             ", (typeof cfg.debug_handler === "function").toString(), "\n",

				"Support:\n",
				"\t", "Load:                     ", (this.support.loading ? "Yes" : "No"), "\n",
				"\t", "Image Resize:             ", (this.support.imageResize ? "Yes" : "No"), "\n"

			].join("")
		);
	},
	/* Note: addSetting and getSetting are no longer used by SWFUpload but are included
		the maintain v2 API compatibility
	*/
	// Public: (Deprecated) addSetting adds a setting value. If the value given is undefined or null then the default_value is used.
	addSetting: function (name, value, default_value) {
		if (value == undefined) {
			return (this.settings[name] = default_value);
		} else {
			return (this.settings[name] = value);
		}
	},
	// Public: (Deprecated) getSetting gets a setting. Returns an empty string if the setting was not found.
	getSetting: function (name) {
		if (this.settings[name] != undefined) {
			return this.settings[name];
		}

		return "";
	},
	// Private: callFlash handles function calls made to the Flash element.
	// Calls are made with a setTimeout for some functions to work around
	// bugs in the ExternalInterface library.
	callFlash: function (functionName, argumentArray) {
		var movieElement, returnValue, returnString;
		
		argumentArray = argumentArray || [];
		movieElement = this.getMovieElement();

		// Flash's method if calling ExternalInterface methods (code adapted from MooTools).
		try {
			if (movieElement != undefined) {
				returnString = movieElement.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray, 0) + '</invoke>');
				returnValue = eval(returnString);
			} else {
				this.debug("Can't call flash because the movie wasn't found.");
			}
		} catch (ex) {
			this.debug("Exception calling flash function '" + functionName + "': " + ex.message);
		}
		
		// Unescape file post param values
		if (returnValue != undefined && typeof returnValue.post === "object") {
			returnValue = this.unescapeFilePostParams(returnValue);
		}

		return returnValue;
	},
	/* *****************************
		-- Flash control methods --
		Your UI should use these
		to operate SWFUpload
	   ***************************** */

	// WARNING: this function does not work in Flash Player 10
	// Public: selectFile causes a File Selection Dialog window to appear.  This
	// dialog only allows 1 file to be selected.
	selectFile: function () {
		this.callFlash("SelectFile");
	},
	// WARNING: this function does not work in Flash Player 10
	// Public: selectFiles causes a File Selection Dialog window to appear/ This
	// dialog allows the user to select any number of files
	// Flash Bug Warning: Flash limits the number of selectable files based on the combined length of the file names.
	// If the selection name length is too long the dialog will fail in an unpredictable manner.  There is no work-around
	// for this bug.
	selectFiles: function () {
		this.callFlash("SelectFiles");
	},
	// Public: startUpload starts uploading the first file in the queue unless
	// the optional parameter 'fileID' specifies the ID 
	startUpload: function (fileID) {
		this.callFlash("StartUpload", [fileID]);
	},
	// Public: startUpload starts uploading the first file in the queue unless
	// the optional parameter 'fileID' specifies the ID 
	startResizedUpload: function (fileID, width, height, encoding, quality, allowEnlarging) {
		this.callFlash("StartUpload", [fileID, { "width": width, "height" : height, "encoding" : encoding, "quality" : quality, "allowEnlarging" : allowEnlarging }]);
	},
	// Public: cancelUpload cancels any queued file.  The fileID parameter may be the file ID or index.
	// If you do not specify a fileID the current uploading file or first file in the queue is cancelled.
	// If you do not want the uploadError event to trigger you can specify false for the triggerErrorEvent parameter.
	cancelUpload: function (fileID, triggerErrorEvent) {
		if (triggerErrorEvent !== false) {
			triggerErrorEvent = true;
		}
		this.callFlash("CancelUpload", [fileID, triggerErrorEvent]);
	},
	// Public: stopUpload stops the current upload and requeues the file at the beginning of the queue.
	// If nothing is currently uploading then nothing happens.
	stopUpload: function () {
		this.callFlash("StopUpload");
	},
	// Public: requeueUpload requeues any file. If the file is requeued or already queued true is returned.
	// If the file is not found or is currently uploading false is returned.  Requeuing a file bypasses the
	// file size, queue size, upload limit and other queue checks.  Certain files can't be requeued (e.g, invalid or zero bytes files).
	requeueUpload: function (indexOrFileID) {
		return this.callFlash("RequeueUpload", [indexOrFileID]);
	},
	/* ************************
	 * Settings methods
	 *   These methods change the SWFUpload settings.
	 *   SWFUpload settings should not be changed directly on the settings object
	 *   since many of the settings need to be passed to Flash in order to take
	 *   effect.
	 * *********************** */

	// Public: getStats gets the file statistics object.
	getStats: function () {
		return this.callFlash("GetStats");
	},
	// Public: setStats changes the SWFUpload statistics.  You shouldn't need to 
	// change the statistics but you can.  Changing the statistics does not
	// affect SWFUpload accept for the successful_uploads count which is used
	// by the upload_limit setting to determine how many files the user may upload.
	setStats: function (statsObject) {
		this.callFlash("SetStats", [statsObject]);
	},
	// Public: getFile retrieves a File object by ID or Index.  If the file is
	// not found then 'null' is returned.
	getFile: function (fileID) {
		if (typeof(fileID) === "number") {
			return this.callFlash("GetFileByIndex", [fileID]);
		} else {
			return this.callFlash("GetFile", [fileID]);
		}
	},
	// Public: getFileFromQueue retrieves a File object by ID or Index.  If the file is
	// not found then 'null' is returned.
	getQueueFile: function (fileID) {
		if (typeof(fileID) === "number") {
			return this.callFlash("GetFileByQueueIndex", [fileID]);
		} else {
			return this.callFlash("GetFile", [fileID]);
		}
	},
	// Public: addFileParam sets a name/value pair that will be posted with the
	// file specified by the Files ID.  If the name already exists then the
	// exiting value will be overwritten.
	addFileParam: function (fileID, name, value) {
		return this.callFlash("AddFileParam", [fileID, name, value]);
	},
	// Public: removeFileParam removes a previously set (by addFileParam) name/value
	// pair from the specified file.
	removeFileParam: function (fileID, name) {
		this.callFlash("RemoveFileParam", [fileID, name]);
	},
	// Public: setUploadUrl changes the upload_url setting.
	setUploadURL: function (url) {
		this.settings.upload_url = url.toString();
		this.callFlash("SetUploadURL", [url]);
	},
	// Public: setPostParams changes the post_params setting
	setPostParams: function (paramsObject) {
		this.settings.post_params = paramsObject;
		this.callFlash("SetPostParams", [paramsObject]);
	},
	// Public: addPostParam adds post name/value pair.  Each name can have only one value.
	addPostParam: function (name, value) {
		this.settings.post_params[name] = value;
		this.callFlash("SetPostParams", [this.settings.post_params]);
	},
	// Public: removePostParam deletes post name/value pair.
	removePostParam: function (name) {
		delete this.settings.post_params[name];
		this.callFlash("SetPostParams", [this.settings.post_params]);
	},
	// Public: setFileTypes changes the file_types setting and the file_types_description setting
	setFileTypes: function (types, description) {
		this.settings.file_types = types;
		this.settings.file_types_description = description;
		this.callFlash("SetFileTypes", [types, description]);
	},
	// Public: setFileSizeLimit changes the file_size_limit setting
	setFileSizeLimit: function (fileSizeLimit) {
		this.settings.file_size_limit = fileSizeLimit;
		this.callFlash("SetFileSizeLimit", [fileSizeLimit]);
	},
	// Public: setFileUploadLimit changes the file_upload_limit setting
	setFileUploadLimit: function (fileUploadLimit) {
		this.settings.file_upload_limit = fileUploadLimit;
		this.callFlash("SetFileUploadLimit", [fileUploadLimit]);
	},
	// Public: setFileQueueLimit changes the file_queue_limit setting
	setFileQueueLimit: function (fileQueueLimit) {
		this.settings.file_queue_limit = fileQueueLimit;
		this.callFlash("SetFileQueueLimit", [fileQueueLimit]);
	},
	// Public: setFilePostName changes the file_post_name setting
	setFilePostName: function (filePostName) {
		this.settings.file_post_name = filePostName;
		this.callFlash("SetFilePostName", [filePostName]);
	},
	// Public: setUseQueryString changes the use_query_string setting
	setUseQueryString: function (useQueryString) {
		this.settings.use_query_string = useQueryString;
		this.callFlash("SetUseQueryString", [useQueryString]);
	},
	// Public: setRequeueOnError changes the requeue_on_error setting
	setRequeueOnError: function (requeueOnError) {
		this.settings.requeue_on_error = requeueOnError;
		this.callFlash("SetRequeueOnError", [requeueOnError]);
	},
	// Public: setHTTPSuccess changes the http_success setting
	setHTTPSuccess: function (http_status_codes) {
		if (typeof http_status_codes === "string") {
			http_status_codes = http_status_codes.replace(" ", "").split(",");
		}
		
		this.settings.http_success = http_status_codes;
		this.callFlash("SetHTTPSuccess", [http_status_codes]);
	},
	// Public: setHTTPSuccess changes the http_success setting
	setAssumeSuccessTimeout: function (timeout_seconds) {
		this.settings.assume_success_timeout = timeout_seconds;
		this.callFlash("SetAssumeSuccessTimeout", [timeout_seconds]);
	},
	// Public: setDebugEnabled changes the debug_enabled setting
	setDebugEnabled: function (debugEnabled) {
		this.settings.debug_enabled = debugEnabled;
		this.callFlash("SetDebugEnabled", [debugEnabled]);
	},
	// Public: setButtonImageURL loads a button image sprite
	setButtonImageURL: function (buttonImageURL) {
		if (buttonImageURL == undefined) {
			buttonImageURL = "";
		}
		
		this.settings.button_image_url = buttonImageURL;
		this.callFlash("SetButtonImageURL", [buttonImageURL]);
	},
	// Public: setButtonDimensions resizes the Flash Movie and button
	setButtonDimensions: function (width, height) {
		this.settings.button_width = width;
		this.settings.button_height = height;
		
		var movie = this.getMovieElement();
		if (movie != undefined) {
			movie.style.width = width + "px";
			movie.style.height = height + "px";
		}
		
		this.callFlash("SetButtonDimensions", [width, height]);
	},
	// Public: setButtonText Changes the text overlaid on the button
	setButtonText: function (html) {
		this.settings.button_text = html;
		this.callFlash("SetButtonText", [html]);
	},
	// Public: setButtonTextPadding changes the top and left padding of the text overlay
	setButtonTextPadding: function (left, top) {
		this.settings.button_text_top_padding = top;
		this.settings.button_text_left_padding = left;
		this.callFlash("SetButtonTextPadding", [left, top]);
	},
	// Public: setButtonTextStyle changes the CSS used to style the HTML/Text overlaid on the button
	setButtonTextStyle: function (css) {
		this.settings.button_text_style = css;
		this.callFlash("SetButtonTextStyle", [css]);
	},
	// Public: setButtonDisabled disables/enables the button
	setButtonDisabled: function (isDisabled) {
		this.settings.button_disabled = isDisabled;
		this.callFlash("SetButtonDisabled", [isDisabled]);
	},
	// Public: setButtonAction sets the action that occurs when the button is clicked
	setButtonAction: function (buttonAction) {
		this.settings.button_action = buttonAction;
		this.callFlash("SetButtonAction", [buttonAction]);
	},
	// Public: setButtonCursor changes the mouse cursor displayed when hovering over the button
	setButtonCursor: function (cursor) {
		this.settings.button_cursor = cursor;
		this.callFlash("SetButtonCursor", [cursor]);
	},
	/* *******************************
		Flash Event Interfaces
		These functions are used by Flash to trigger the various
		events.
		
		All these functions a Private.
		
		Because the ExternalInterface library is buggy the event calls
		are added to a queue and the queue then executed by a setTimeout.
		This ensures that events are executed in a determinate order and that
		the ExternalInterface bugs are avoided.
	******************************* */
	
	queueEvent: function (handlerName, argumentArray) {
		// Warning: Don't call this.debug inside here or you'll create an infinite loop
		var self = this;
		
		if (argumentArray == undefined) {
			argumentArray = [];
		} else if (!(argumentArray instanceof Array)) {
			argumentArray = [argumentArray];
		}
		
		if (typeof this.settings[handlerName] === "function") {
			// Queue the event
			this.eventQueue.push(function () {
				this.settings[handlerName].apply(this, argumentArray);
			});
			
			// Execute the next queued event
			setTimeout(function () {
				self.executeNextEvent();
			}, 0);
			
		} else if (this.settings[handlerName] !== null) {
			throw "Event handler " + handlerName + " is unknown or is not a function";
		}
	},
	// Private: Causes the next event in the queue to be executed.  Since events are queued using a setTimeout
	// we must queue them in order to garentee that they are executed in order.
	executeNextEvent: function () {
		// Warning: Don't call this.debug inside here or you'll create an infinite loop

		var  f = this.eventQueue ? this.eventQueue.shift() : null;
		if (typeof(f) === "function") {
			f.apply(this);
		}
	},
	// Private: unescapeFileParams is part of a workaround for a flash bug where objects passed through ExternalInterface cannot have
	// properties that contain characters that are not valid for JavaScript identifiers. To work around this
	// the Flash Component escapes the parameter names and we must unescape again before passing them along.
	unescapeFilePostParams: function (file) {
		var reg = /[$]([0-9a-f]{4})/i, unescapedPost = {}, uk, k, match;

		if (file != undefined) {
			for (k in file.post) {
				if (file.post.hasOwnProperty(k)) {
					uk = k;
					while ((match = reg.exec(uk)) !== null) {
						uk = uk.replace(match[0], String.fromCharCode(parseInt("0x" + match[1], 16)));
					}
					unescapedPost[uk] = file.post[k];
				}
			}

			file.post = unescapedPost;
		}

		return file;
	},
	// Private: This event is called by SWFUpload Init after we've determined what the user's Flash Player supports.
	// Use the swfupload_preload_handler event setting to execute custom code when SWFUpload has loaded.
	// Return false to prevent SWFUpload from loading and allow your script to do something else if your required feature is
	// not supported
	swfuploadPreload: function () {
		var returnValue;
		if (typeof this.settings.swfupload_preload_handler === "function") {
			returnValue = this.settings.swfupload_preload_handler.call(this);
		} else if (this.settings.swfupload_preload_handler != undefined) {
			throw "upload_start_handler must be a function";
		}

		// Convert undefined to true so if nothing is returned from the upload_start_handler it is
		// interpretted as 'true'.
		if (returnValue === undefined) {
			returnValue = true;
		}
		
		return !!returnValue;
	},
	// Private: This event is called by Flash when it has finished loading. Don't modify this.
	// Use the swfupload_loaded_handler event setting to execute custom code when SWFUpload has loaded.
	flashReady: function () {
		// Check that the movie element is loaded correctly with its ExternalInterface methods defined
		var movieElement = 	this.cleanUp();

		if (!movieElement) {
			this.debug("Flash called back ready but the flash movie can't be found.");
			return;
		}

		this.queueEvent("swfupload_loaded_handler");
	},
	// Private: removes Flash added fuctions to the DOM node to prevent memory leaks in IE.
	// This function is called by Flash each time the ExternalInterface functions are created.
	cleanUp: function () {
		var key, movieElement = this.getMovieElement();
		
		// Pro-actively unhook all the Flash functions
		try {
			if (movieElement && typeof(movieElement.CallFunction) === "unknown") { // We only want to do this in IE
				this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");
				for (key in movieElement) {
					try {
						if (typeof(movieElement[key]) === "function") {
							movieElement[key] = null;
						}
					} catch (ex) {
					}
				}
			}
		} catch (ex1) {
		
		}

		// Fix Flashes own cleanup code so if the SWF Movie was removed from the page
		// it doesn't display errors.
		window["__flash__removeCallback"] = function (instance, name) {
			try {
				if (instance) {
					instance[name] = null;
				}
			} catch (flashEx) {
			
			}
		};
		
		return movieElement;
	},
	/* When the button_action is set to None this event gets fired and executes the mouse_click_handler */
	mouseClick: function () {
		this.queueEvent("mouse_click_handler");
	},
	mouseOver: function () {
		this.queueEvent("mouse_over_handler");
	},
	mouseOut: function () {
		this.queueEvent("mouse_out_handler");
	},
	/* This is a chance to do something before the browse window opens */
	fileDialogStart: function () {
		this.queueEvent("file_dialog_start_handler");
	},
	/* Called when a file is successfully added to the queue. */
	fileQueued: function (file) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("file_queued_handler", file);
	},
	/* Handle errors that occur when an attempt to queue a file fails. */
	fileQueueError: function (file, errorCode, message) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("file_queue_error_handler", [file, errorCode, message]);
	},
	/* Called after the file dialog has closed and the selected files have been queued.
		You could call startUpload here if you want the queued files to begin uploading immediately. */
	fileDialogComplete: function (numFilesSelected, numFilesQueued, numFilesInQueue) {
		this.queueEvent("file_dialog_complete_handler", [numFilesSelected, numFilesQueued, numFilesInQueue]);
	},
	uploadResizeStart: function (file, resizeSettings) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("upload_resize_start_handler", [file, resizeSettings.width, resizeSettings.height, resizeSettings.encoding, resizeSettings.quality]);
	},
	uploadStart: function (file) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("return_upload_start_handler", file);
	},
	returnUploadStart: function (file) {
		var returnValue;
		if (typeof this.settings.upload_start_handler === "function") {
			file = this.unescapeFilePostParams(file);
			returnValue = this.settings.upload_start_handler.call(this, file);
		} else if (this.settings.upload_start_handler != undefined) {
			throw "upload_start_handler must be a function";
		}

		// Convert undefined to true so if nothing is returned from the upload_start_handler it is
		// interpretted as 'true'.
		if (returnValue === undefined) {
			returnValue = true;
		}
		
		returnValue = !!returnValue;
		
		this.callFlash("ReturnUploadStart", [returnValue]);
	},
	uploadProgress: function (file, bytesComplete, bytesTotal) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("upload_progress_handler", [file, bytesComplete, bytesTotal]);
	},
	uploadError: function (file, errorCode, message) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("upload_error_handler", [file, errorCode, message]);
	},
	uploadSuccess: function (file, serverData, responseReceived) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("upload_success_handler", [file, serverData, responseReceived]);
	},
	uploadComplete: function (file) {
		file = this.unescapeFilePostParams(file);
		this.queueEvent("upload_complete_handler", file);
	},
	/* Called by SWFUpload JavaScript and Flash functions when debug is enabled. By default it writes messages to the
	   internal debug console.  You can override this event and have messages written where you want. */
	debug: function (message) {
		this.queueEvent("debug_handler", message);
	},
	/* **********************************
		Debug Console
		The debug console is a self contained, in page location
		for debug message to be sent.  The Debug Console adds
		itself to the body if necessary.

		The console is automatically scrolled as messages appear.
		
		If you are using your own debug handler or when you deploy to production and
		have debug disabled you can remove these functions to reduce the file size
		and complexity.
	********************************** */
	   
	// Private: debugMessage is the default debug_handler.  If you want to print debug messages
	// call the debug() function.  When overriding the function your own function should
	// check to see if the debug setting is true before outputting debug information.
	debugMessage: function (message) {
		var exceptionMessage, exceptionValues, key;

		if (this.settings.debug) {
			exceptionValues = [];

			// Check for an exception object and print it nicely
			if (typeof message === "object" && typeof message.name === "string" && typeof message.message === "string") {
				for (key in message) {
					if (message.hasOwnProperty(key)) {
						exceptionValues.push(key + ": " + message[key]);
					}
				}
				exceptionMessage = exceptionValues.join("\n") || "";
				exceptionValues = exceptionMessage.split("\n");
				exceptionMessage = "EXCEPTION: " + exceptionValues.join("\nEXCEPTION: ");
				SWFUpload.Console.writeLine(exceptionMessage);
			} else {
				SWFUpload.Console.writeLine(message);
			}
		}
	}
});

SWFUpload.Console = {};
SWFUpload.Console.writeLine = function (message) {
	var console, documentForm;

	try {
		console = document.getElementById("SWFUpload_Console");

		if (!console) {
			documentForm = document.createElement("form");
			document.getElementsByTagName("body")[0].appendChild(documentForm);

			console = document.createElement("textarea");
			console.id = "SWFUpload_Console";
			console.style.fontFamily = "monospace";
			console.setAttribute("wrap", "off");
			console.wrap = "off";
			console.style.overflow = "auto";
			console.style.width = "700px";
			console.style.height = "350px";
			console.style.margin = "5px";
			documentForm.appendChild(console);
		}

		console.value += message + "\n";

		console.scrollTop = console.scrollHeight - console.clientHeight;
	} catch (ex) {
		alert("Exception: " + ex.name + " Message: " + ex.message);
	}
};

}.call(FOCUS, SWFUpload);

/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
swfobject = function () {

    var UNDEF = "undefined",
        OBJECT = "object",
        SHOCKWAVE_FLASH = "Shockwave Flash",
        SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
        FLASH_MIME_TYPE = "application/x-shockwave-flash",
        EXPRESS_INSTALL_ID = "SWFObjectExprInst",
        ON_READY_STATE_CHANGE = "onreadystatechange",

        win = window,
        doc = document,
        nav = navigator,

        plugin = false,
        domLoadFnArr = [],
        regObjArr = [],
        objIdArr = [],
        listenersArr = [],
        storedFbContent,
        storedFbContentId,
        storedCallbackFn,
        storedCallbackObj,
        isDomLoaded = false,
        isExpressInstallActive = false,
        dynamicStylesheet,
        dynamicStylesheetMedia,
        autoHideShow = true,
        encodeURIEnabled = false,

    /* Centralized function for browser feature detection
        - User agent string detection is only used when no good alternative is possible
        - Is executed directly for optimal performance
    */
    ua = function () {
        var w3cdom = typeof doc.getElementById !== UNDEF && typeof doc.getElementsByTagName !== UNDEF && typeof doc.createElement !== UNDEF,
            u = nav.userAgent.toLowerCase(),
            p = nav.platform.toLowerCase(),
            windows = p ? /win/.test(p) : /win/.test(u),
            mac = p ? /mac/.test(p) : /mac/.test(u),
            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
            ie = nav.appName === "Microsoft Internet Explorer",
            playerVersion = [0, 0, 0],
            d = null;
        if (typeof nav.plugins !== UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] === OBJECT) {
            d = nav.plugins[SHOCKWAVE_FLASH].description;
            // nav.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
            if (d && (typeof nav.mimeTypes !== UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                plugin = true;
                ie = false; // cascaded feature detection for Internet Explorer
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                playerVersion[0] = toInt(d.replace(/^(.*)\..*$/, "$1"));
                playerVersion[1] = toInt(d.replace(/^.*\.(.*)\s.*$/, "$1"));
                playerVersion[2] = /[a-zA-Z]/.test(d) ? toInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1")) : 0;
            }
        }
        else{
            try {
                var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                if (a) { // a will return null when ActiveX is disabled
                    d = a.GetVariable("$version");
                    if (d) {
                        ie = true; // cascaded feature detection for Internet Explorer
                        d = d.split(" ")[1].split(",");
                        playerVersion = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                    }
                }
            }catch (e) {}
        }
        return {w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac};
    }(),

    /* Cross-browser onDomLoad
        - Will fire an event as soon as the DOM of a web page is loaded
        - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
        - Regular onload serves as fallback
    */
    onDomLoad = function () {
        if (!ua.w3) { return; }
        if ((typeof doc.readyState !== UNDEF && (doc.readyState === "complete" || doc.readyState === "interactive")) || (typeof doc.readyState === UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
            callDomLoadFunctions();
        }
        if (!isDomLoaded) {
            if (typeof doc.addEventListener !== UNDEF) {
                doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
            }
            if (ua.ie) {
				var stand = !!doc.addEventListener;
				if(stand){
					doc.addEventListener(ON_READY_STATE_CHANGE, function detach() {
						if (doc.readyState === "complete") {
							doc.removeEventListener(ON_READY_STATE_CHANGE, detach);
							callDomLoadFunctions();
						}
					}, false);
				}else{
					doc.attachEvent(ON_READY_STATE_CHANGE, function detach() {
						if (doc.readyState === "complete") {
							doc.detachEvent(ON_READY_STATE_CHANGE, detach);
							callDomLoadFunctions();
						}
					});
				}
                
                if (win == top) { // if not inside an iframe
                    (function checkDomLoadedIE() {
                        if (isDomLoaded) { return; }
                        try {
                            doc.documentElement.doScroll("left");
                        }
                        catch (e) {
                            setTimeout(checkDomLoadedIE, 0);
                            return;
                        }
                        callDomLoadFunctions();
                    }());
                }
            }
            if (ua.wk) {
                (function checkDomLoadedWK() {
                    if (isDomLoaded) { return; }
                    if (!/loaded|complete/.test(doc.readyState)) {
                        setTimeout(checkDomLoadedWK, 0);
                        return;
                    }
                    callDomLoadFunctions();
                }());
            }
        }
    }();

    function callDomLoadFunctions() {
        if (isDomLoaded || !document.getElementsByTagName("body")[0]) { return; }
        try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
            var t, span = createElement("span");
            span.style.display = "none"; //hide the span in case someone has styled spans via CSS
            t = doc.getElementsByTagName("body")[0].appendChild(span);
            t.parentNode.removeChild(t);
            t = null; //clear the variables
            span = null;
        }
        catch (e) { return; }
        isDomLoaded = true;
        var dl = domLoadFnArr.length;
        for (var i = 0; i < dl; i++) {
            domLoadFnArr[i]();
        }
    }

    function addDomLoadEvent(fn) {
        if (isDomLoaded) {
            fn();
        }
        else {
            domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
        }
    }

    /* Cross-browser onload
        - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
        - Will fire an event as soon as a web page including all of its assets are loaded
     */
    function addLoadEvent(fn) {
        if (typeof win.addEventListener !== UNDEF) {
            win.addEventListener("load", fn, false);
        }
        else if (typeof doc.addEventListener !== UNDEF) {
            doc.addEventListener("load", fn, false);
        }
        else if (typeof win.attachEvent !== UNDEF) {
            addListener(win, "onload", fn);
        }
        else if (typeof win.onload === "function") {
            var fnOld = win.onload;
            win.onload = function () {
                fnOld();
                fn();
            };
        }
        else {
            win.onload = fn;
        }
    }

    /* Detect the Flash Player version for non-Internet Explorer browsers
        - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
          a. Both release and build numbers can be detected
          b. Avoid wrong descriptions by corrupt installers provided by Adobe
          c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
        - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
    */
    function testPlayerVersion() {
        var b = doc.getElementsByTagName("body")[0];
        var o = createElement(OBJECT);
        o.setAttribute("style", "visibility: hidden;");
        o.setAttribute("type", FLASH_MIME_TYPE);
        var t = b.appendChild(o);
        if (t) {
            var counter = 0;
            (function checkGetVariable() {
                if (typeof t.GetVariable !== UNDEF) {
                    try {
                        var d = t.GetVariable("$version");
                        if (d) {
                            d = d.split(" ")[1].split(",");
                            ua.pv = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                        }
                    } catch (e) {
                        //t.GetVariable("$version") is known to fail in Flash Player 8 on Firefox
                        //If this error is encountered, assume FP8 or lower. Time to upgrade.
                        ua.pv = [8, 0, 0];
                    }
                }
                else if (counter < 10) {
                    counter++;
                    setTimeout(checkGetVariable, 10);
                    return;
                }
                b.removeChild(o);
                t = null;
                matchVersions();
            }());
        }
        else {
            matchVersions();
        }
    }

    /* Perform Flash Player and SWF version matching; static publishing only
    */
    function matchVersions() {
        var rl = regObjArr.length;
        if (rl > 0) {
            for (var i = 0; i < rl; i++) { // for each registered object element
                var id = regObjArr[i].id;
                var cb = regObjArr[i].callbackFn;
                var cbObj = {success: false, id: id};
                if (ua.pv[0] > 0) {
                    var obj = getElementById(id);
                    if (obj) {
                        if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                            setVisibility(id, true);
                            if (cb) {
                                cbObj.success = true;
                                cbObj.ref = getObjectById(id);
                                cbObj.id = id;
                                cb(cbObj);
                            }
                        }
                        else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                            var att = {};
                            att.data = regObjArr[i].expressInstall;
                            att.width = obj.getAttribute("width") || "0";
                            att.height = obj.getAttribute("height") || "0";
                            if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                            if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                            // parse HTML object param element's name-value pairs
                            var par = {};
                            var p = obj.getElementsByTagName("param");
                            var pl = p.length;
                            for (var j = 0; j < pl; j++) {
                                if (p[j].getAttribute("name").toLowerCase() !== "movie") {
                                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                                }
                            }
                            showExpressInstall(att, par, id, cb);
                        }
                        else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display fallback content instead of SWF
                            displayFbContent(obj);
                            if (cb) { cb(cbObj); }
                        }
                    }
                }
                else { // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or fallback content)
                    setVisibility(id, true);
                    if (cb) {
                        var o = getObjectById(id); // test whether there is an HTML object element or not
                        if (o && typeof o.SetVariable !== UNDEF) {
                            cbObj.success = true;
                            cbObj.ref = o;
                            cbObj.id = o.id;
                        }
                        cb(cbObj);
                    }
                }
            }
        }
    }

    /* Main function
        - Will preferably execute onDomLoad, otherwise onload (as a fallback)
    */
    domLoadFnArr[0] = function () {
        if (plugin) {
            testPlayerVersion();
        }
        else {
            matchVersions();
        }
    };

    function getObjectById(objectIdStr) {
        var r = null,
            o = getElementById(objectIdStr);

        if (o && o.nodeName.toUpperCase() === "OBJECT") {
            //If targeted object is valid Flash file
            if (typeof o.SetVariable !== UNDEF) {
                r = o;
            } else {
                //If SetVariable is not working on targeted object but a nested object is
                //available, assume classic nested object markup. Return nested object.

                //If SetVariable is not working on targeted object and there is no nested object,
                //return the original object anyway. This is probably new simplified markup.

                r = o.getElementsByTagName(OBJECT)[0] || o;
            }
        }

        return r;
    }

    /* Requirements for Adobe Express Install
        - only one instance can be active at a time
        - fp 6.0.65 or higher
        - Win/Mac OS only
        - no Webkit engines older than version 312
    */
    function canExpressInstall() {
        return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }

    /* Show the Adobe Express Install dialog
        - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
    */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {

        var obj = getElementById(replaceElemIdStr);

        //Ensure that replaceElemIdStr is really a string and not an element
        replaceElemIdStr = getId(replaceElemIdStr);

        isExpressInstallActive = true;
        storedCallbackFn = callbackFn || null;
        storedCallbackObj = {success: false, id: replaceElemIdStr};

        if (obj) {
            if (obj.nodeName.toUpperCase() === "OBJECT") { // static publishing
                storedFbContent = abstractFbContent(obj);
                storedFbContentId = null;
            }
            else { // dynamic publishing
                storedFbContent = obj;
                storedFbContentId = replaceElemIdStr;
            }
            att.id = EXPRESS_INSTALL_ID;
            if (typeof att.width === UNDEF || (!/%$/.test(att.width) && toInt(att.width) < 310)) { att.width = "310"; }
            if (typeof att.height === UNDEF || (!/%$/.test(att.height) && toInt(att.height) < 137)) { att.height = "137"; }
            var pt = ua.ie ? "ActiveX" : "PlugIn",
                fv = "MMredirectURL=" + encodeURIComponent(win.location.toString().replace(/&/g, "%26")) + "&MMplayerType=" + pt + "&MMdoctitle=" + encodeURIComponent(doc.title.slice(0, 47) + " - Flash Player Installation");
            if (typeof par.flashvars !== UNDEF) {
                par.flashvars += "&" + fv;
            }
            else {
                par.flashvars = fv;
            }
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            if (ua.ie && obj.readyState != 4) {
                var newObj = createElement("div");
                replaceElemIdStr += "SWFObjectNew";
                newObj.setAttribute("id", replaceElemIdStr);
                obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
                obj.style.display = "none";
                removeSWF(obj); //removeSWF accepts elements now
            }
            createSWF(att, par, replaceElemIdStr);
        }
    }

    /* Functions to abstract and display fallback content
    */
    function displayFbContent(obj) {
        if (ua.ie && obj.readyState != 4) {
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            obj.style.display = "none";
            var el = createElement("div");
            obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the fallback content
            el.parentNode.replaceChild(abstractFbContent(obj), el);
            removeSWF(obj); //removeSWF accepts elements now
        }
        else {
            obj.parentNode.replaceChild(abstractFbContent(obj), obj);
        }
    }

    function abstractFbContent(obj) {
        var ac = createElement("div");
        if (ua.win && ua.ie) {
            ac.innerHTML = obj.innerHTML;
        }
        else {
            var nestedObj = obj.getElementsByTagName(OBJECT)[0];
            if (nestedObj) {
                var c = nestedObj.childNodes;
                if (c) {
                    var cl = c.length;
                    for (var i = 0; i < cl; i++) {
                        if (!(c[i].nodeType == 1 && c[i].nodeName === "PARAM") && !(c[i].nodeType == 8)) {
                            ac.appendChild(c[i].cloneNode(true));
                        }
                    }
                }
            }
        }
        return ac;
    }

    function createIeObject(url, paramStr) {
        var div = createElement("div");
        div.innerHTML = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='" + url + "'>" + paramStr + "</object>";
        return div.firstChild;
    }

    /* Cross-browser dynamic SWF creation
    */
    function createSWF(attObj, parObj, id) {
        var r, el = getElementById(id);
        id = getId(id); // ensure id is truly an ID and not an element

        if (ua.wk && ua.wk < 312) { return r; }

        if (el) {
            var o = (ua.ie) ? createElement("div") : createElement(OBJECT),
                attr,
                attrLower,
                param;

            if (typeof attObj.id === UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the fallback content
                attObj.id = id;
            }

            //Add params
            for (param in parObj) {
                //filter out prototype additions from other potential libraries and IE specific param element
                if (parObj.hasOwnProperty(param) && param.toLowerCase() !== "movie") {
                    createObjParam(o, param, parObj[param]);
                }
            }

            //Create IE object, complete with param nodes
            if (ua.ie) { o = createIeObject(attObj.data, o.innerHTML); }

            //Add attributes to object
            for (attr in attObj) {
                if (attObj.hasOwnProperty(attr)) { // filter out prototype additions from other potential libraries
                    attrLower = attr.toLowerCase();

                    // 'class' is an ECMA4 reserved keyword
                    if (attrLower === "styleclass") {
                        o.setAttribute("class", attObj[attr]);
                    } else if (attrLower !== "classid" && attrLower !== "data") {
                        o.setAttribute(attr, attObj[attr]);
                    }
                }
            }

            if (ua.ie) {
                objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
            } else {
                o.setAttribute("type", FLASH_MIME_TYPE);
                o.setAttribute("data", attObj.data);
            }

            el.parentNode.replaceChild(o, el);
            r = o;
        }

        return r;
    }

    function createObjParam(el, pName, pValue) {
        var p = createElement("param");
        p.setAttribute("name", pName);
        p.setAttribute("value", pValue);
        el.appendChild(p);
    }

    /* Cross-browser SWF removal
        - Especially needed to safely and completely remove a SWF in Internet Explorer
    */
    function removeSWF(id) {
        var obj = getElementById(id);
        if (obj && obj.nodeName.toUpperCase() === "OBJECT") {
            if (ua.ie) {
                obj.style.display = "none";
                (function removeSWFInIE() {
                    if (obj.readyState == 4) {
                        //This step prevents memory leaks in Internet Explorer
                        for (var i in obj) {
                            if (typeof obj[i] === "function") {
                                obj[i] = null;
                            }
                        }
                        obj.parentNode.removeChild(obj);
                    } else {
                        setTimeout(removeSWFInIE, 10);
                    }
                }());
            }
            else {
                obj.parentNode.removeChild(obj);
            }
        }
    }

    function isElement(id) {
        return (id && id.nodeType && id.nodeType === 1);
    }

    function getId(thing) {
        return (isElement(thing)) ? thing.id : thing;
    }

    /* Functions to optimize JavaScript compression
    */
    function getElementById(id) {

        //Allow users to pass an element OR an element's ID
        if (isElement(id)) { return id; }

        var el = null;
        try {
            el = doc.getElementById(id);
        }
        catch (e) {}
        return el;
    }

    function createElement(el) {
        return doc.createElement(el);
    }

    //To aid compression; replaces 14 instances of pareseInt with radix
    function toInt(str) {
        return parseInt(str, 10);
    }

    /* Updated attachEvent function for Internet Explorer
        - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
    */
    function addListener(target, eventType, fn) {
        target.attachEvent(eventType, fn);
        listenersArr[listenersArr.length] = [target, eventType, fn];
    }

    /* Flash Player and SWF content version matching
    */
    function hasPlayerVersion(rv) {
        rv += ""; //Coerce number to string, if needed.
        var pv = ua.pv, v = rv.split(".");
        v[0] = toInt(v[0]);
        v[1] = toInt(v[1]) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
        v[2] = toInt(v[2]) || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }

    /* Cross-browser dynamic CSS creation
        - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    */
    function createCSS(sel, decl, media, newStyle) {
        var h = doc.getElementsByTagName("head")[0];
        if (!h) { return; } // to also support badly authored HTML pages that lack a head element
        var m = (typeof media === "string") ? media : "screen";
        if (newStyle) {
            dynamicStylesheet = null;
            dynamicStylesheetMedia = null;
        }
        if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
            // create dynamic stylesheet + get a global reference to it
            var s = createElement("style");
            s.setAttribute("type", "text/css");
            s.setAttribute("media", m);
            dynamicStylesheet = h.appendChild(s);
            if (ua.ie && typeof doc.styleSheets !== UNDEF && doc.styleSheets.length > 0) {
                dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
            }
            dynamicStylesheetMedia = m;
        }
        // add style rule
        if (dynamicStylesheet) {
            if (typeof dynamicStylesheet.addRule !== UNDEF) {
                dynamicStylesheet.addRule(sel, decl);
            } else if (typeof doc.createTextNode !== UNDEF) {
                dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
            }
        }
    }

    function setVisibility(id, isVisible) {
        if (!autoHideShow) { return; }
        var v = isVisible ? "visible" : "hidden",
            el = getElementById(id);
        if (isDomLoaded && el) {
            el.style.visibility = v;
        } else if (typeof id === "string") {
            createCSS("#" + id, "visibility:" + v);
        }
    }

    /* Filter to avoid XSS attacks
    */
    function urlEncodeIfNecessary(s) {
        var regex = /[\\\"<>\.;]/;
        var hasBadChars = regex.exec(s) !== null;
        return hasBadChars && typeof encodeURIComponent !== UNDEF ? encodeURIComponent(s) : s;
    }

    /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
    */
    var cleanup = function () {
        if (ua.ie && window.attachEvent) {
            window.attachEvent("onunload", function () {
                // remove listeners to avoid memory leaks
                var ll = listenersArr.length;
                for (var i = 0; i < ll; i++) {
                    listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
                }
                // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
                var il = objIdArr.length;
                for (var j = 0; j < il; j++) {
                    removeSWF(objIdArr[j]);
                }
                // cleanup library's main closures to avoid memory leaks
                for (var k in ua) {
                    ua[k] = null;
                }
                ua = null;
                for (var l in swfobject) {
                    swfobject[l] = null;
                }
                swfobject = null;
            });
        }
    }();

    return {
        /* Public API
            - Reference: http://code.google.com/p/swfobject/wiki/documentation
        */
        registerObject: function (objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
            if (ua.w3 && objectIdStr && swfVersionStr) {
                var regObj = {};
                regObj.id = objectIdStr;
                regObj.swfVersion = swfVersionStr;
                regObj.expressInstall = xiSwfUrlStr;
                regObj.callbackFn = callbackFn;
                regObjArr[regObjArr.length] = regObj;
                setVisibility(objectIdStr, false);
            }
            else if (callbackFn) {
                callbackFn({success: false, id: objectIdStr});
            }
        },

        getObjectById: function (objectIdStr) {
            if (ua.w3) {
                return getObjectById(objectIdStr);
            }
        },

        embedSWF: function (swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {

            var id = getId(replaceElemIdStr),
                callbackObj = {success: false, id: id};

            if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                setVisibility(id, false);
                addDomLoadEvent(function () {
                    widthStr += ""; // auto-convert to string
                    heightStr += "";
                    var att = {};
                    if (attObj && typeof attObj === OBJECT) {
                        for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                            att[i] = attObj[i];
                        }
                    }
                    att.data = swfUrlStr;
                    att.width = widthStr;
                    att.height = heightStr;
                    var par = {};
                    if (parObj && typeof parObj === OBJECT) {
                        for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                            par[j] = parObj[j];
                        }
                    }
                    if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                        for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                            if (flashvarsObj.hasOwnProperty(k)) {

                                var key = (encodeURIEnabled) ? encodeURIComponent(k) : k,
                                    value = (encodeURIEnabled) ? encodeURIComponent(flashvarsObj[k]) : flashvarsObj[k];

                                if (typeof par.flashvars !== UNDEF) {
                                    par.flashvars += "&" + key + "=" + value;
                                }
                                else {
                                    par.flashvars = key + "=" + value;
                                }

                            }
                        }
                    }
                    if (hasPlayerVersion(swfVersionStr)) { // create SWF
                        var obj = createSWF(att, par, replaceElemIdStr);
                        if (att.id == id) {
                            setVisibility(id, true);
                        }
                        callbackObj.success = true;
                        callbackObj.ref = obj;
                        callbackObj.id = obj.id;
                    }
                    else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
                        att.data = xiSwfUrlStr;
                        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                        return;
                    }
                    else { // show fallback content
                        setVisibility(id, true);
                    }
                    if (callbackFn) { callbackFn(callbackObj); }
                });
            }
            else if (callbackFn) { callbackFn(callbackObj); }
        },

        switchOffAutoHideShow: function () {
            autoHideShow = false;
        },

        enableUriEncoding: function (bool) {
            encodeURIEnabled = (typeof bool === UNDEF) ? true : bool;
        },

        ua: ua,

        getFlashPlayerVersion: function () {
            return {major: ua.pv[0], minor: ua.pv[1], release: ua.pv[2]};
        },

        hasFlashPlayerVersion: hasPlayerVersion,

        createSWF: function (attObj, parObj, replaceElemIdStr) {
            if (ua.w3) {
                return createSWF(attObj, parObj, replaceElemIdStr);
            }
            else {
                return undefined;
            }
        },

        showExpressInstall: function (att, par, replaceElemIdStr, callbackFn) {
            if (ua.w3 && canExpressInstall()) {
                showExpressInstall(att, par, replaceElemIdStr, callbackFn);
            }
        },

        removeSWF: function (objElemIdStr) {
            if (ua.w3) {
                removeSWF(objElemIdStr);
            }
        },

        createCSS: function (selStr, declStr, mediaStr, newStyleBoolean) {
            if (ua.w3) {
                createCSS(selStr, declStr, mediaStr, newStyleBoolean);
            }
        },

        addDomLoadEvent: addDomLoadEvent,

        addLoadEvent: addLoadEvent,

        getQueryParamValue: function (param) {
            var q = doc.location.search || doc.location.hash;
            if (q) {
                if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
                if (!param) {
                    return urlEncodeIfNecessary(q);
                }
                var pairs = q.split("&");
                for (var i = 0; i < pairs.length; i++) {
                    if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                        return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                    }
                }
            }
            return "";
        },

        // For internal usage only
        expressInstallCallback: function () {
            if (isExpressInstallActive) {
                var obj = getElementById(EXPRESS_INSTALL_ID);
                if (obj && storedFbContent) {
                    obj.parentNode.replaceChild(storedFbContent, obj);
                    if (storedFbContentId) {
                        setVisibility(storedFbContentId, true);
                        if (ua.ie) { storedFbContent.style.display = "block"; }
                    }
                    if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
                }
                isExpressInstallActive = false;
            }
        },

        version: "2.3"

    };
}();

swfobject.addDomLoadEvent(function () {
	if (typeof(SWFUpload.onload) === "function") {
		SWFUpload.onload.call(window);
	}
});
;void function(window, document, undefined){
	var THAT = this;
	var util = this.util;
	var widget = this.widget;
	var upload = widget.Upload;
	var MODE = upload.MODE;
	var CURSOR = upload.CURSOR;
	//var CSS = upload.CSS;
	
	var DIC_PARAMS = {
		flash_url:						'flashURL',
		flash9_url:						'flash9URL',
		upload_url:						'uploadURL',
		file_post_name:					'filePostName',
		post_params:					'postParams',
		file_types:						'fileTypes',
		file_types_description:			'fileTypesDescription',
		file_upload_limit:				'uploadLimit',
		file_size_limit:				'sizeLimit',
		file_queue_limit:				'queueLimit',
		button_placeholder_id:			'placeholder',
		swfupload_loaded_handler:		'events.ready',
		swfupload_load_failed_handler:	'events.fail',
		file_dialog_start_handler:		'events.dialogStart',
		file_queued_handler:			'events.queued',
		file_queue_error_handler:		'events.queueError',
		file_dialog_complete_handler:	'events.dialogComplete',
		upload_start_handler:			'events.uploadStart',
		upload_progress_handler:		'events.uploadProgress',
		upload_error_handler:			'events.uploadError',
		upload_success_handler:			'events.uploadSuccess',
		upload_complete_handler:		'events.uploadComplete',
		debug:							'debug',
		button_width:					'button.width',
		button_height:					'button.height',
		button_text:					'button.text'
	};
	
	var getValue = function(path){
		path = path || '';
		var arr_path = path.split(/\./);
		
		var part = this;
		var gotIt = false;
		var key;
		
		while(key = arr_path.shift()){
			if(key in part){
				gotIt = true;
				part = part[key];
				//continue;
			}else{
				gotIt = false;
				break;
			}
		}
		
		return {
			has: gotIt,
			value: gotIt ? part : null
		};
	};
	
	widget.Upload_Flash = function(cfg){
		this.constructor = arguments.callee;
		this.mode = MODE.FLASH;

		this.cfg = {};
		this.elems = {};
		this._ = {
			flash_cfg: {
				flash_url: THAT.PATH_FLASH || THAT.BASEPATH + 'widget/upload/flash/swfupload.swf',
				flash9_url: THAT.PATH_FLASH_FP9 || THAT.BASEPATH + 'wigdet/upload/flash/swfupload_fp9.swf',
				debug: false,
				file_upload_limit: -1,
				
				button_width: 650,
				button_height: 200,
				button_cursor: CURSOR.POINTER,
				button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT
			},
			status: upload.TURNING.ON
		};
		this.set(cfg);
		this.init();
		
		this.instance = new SWFUpload(this._.flash_cfg);
	};
	
	widget.Upload_Flash.prototype = new widget.UploadBase();
	util.extend(true, widget.Upload_Flash.prototype, {
		init: function(){
			this.elems.holder = document.createElement('div');
			this.elems.flashWrap = document.createElement('div');
			this.elems.flashHolder = document.createElement('span');
			var id = this.elems.flashHolder.id = 'FOCUS_UPLOAD_FlashHolder_' + util.random(0, 1000);
			
			var place = util.query
				? util.query(this._.flash_cfg.button_placeholder_id)
				: document.getElementById(this._.flash_cfg.button_placeholder_id.replace(/^#/, ''));
			
			if('length' in place){
				place = place[0];
			}
			
			if(place){
				place.parentNode.insertBefore(this.elems.holder, place);
				place.parentNode.removeChild(place);
				this.elems.holder.appendChild(this.elems.flashWrap);
				this.elems.flashWrap.appendChild(this.elems.flashHolder);
			}
			
			this.__setStyle('flash', this.elems.holder, this.elems.flashWrap, this._.flash_cfg.button_text);
			
			this._.flash_cfg.button_placeholder_id = id;
			this._.flash_cfg.button_text = '';
		},
		set: function(cfg){
			util.extend(true, this.cfg, cfg);
			this.__setFlashCfg(this.cfg);
			
			return this;
		},
		__setFlashCfg: function(cfg){
			var dic = DIC_PARAMS;
			
			var ret;
			for(var key in dic){
				ret = getValue.call(cfg, dic[key]);

				if(ret.has){
					this._.flash_cfg[key] = ret.value;
				}
			}
			
			//multi / single file(s) selection dialog
			this._.flash_cfg.button_action = SWFUpload.BUTTON_ACTION[cfg.multiple ? 'SELECT_FILES' : 'SELECT_FILE'];

			if(this.isReady){
				this.multiple(this.cfg.multiple);
				this.setFileTypes(this.cfg.fileTypes);
				this.setFileSizeLimit(this.cfg.sizeLimit);
				this.setUploadURL(this.cfg.uploadURL);
				this.setFilePostName(this.cfg.filePostName);
				this.setFileQueueLimit(this.cfg.queueLimit);
			}
		},
		__setStyle: function(mode, wrap, flashWrap, text){
			var CSS = this.cfg.css;
			
			wrap.className = CSS.WRAP;
			flashWrap.className = CSS.FLASH;
			
			var label;
			label = wrap.getElementsByTagName('label');
			if(label.length){
				wrap.removeChild(label[0]);
			}
			
			label = document.createElement('label');
			label.className = CSS.TEXT;
			label.innerHTML = text;
			wrap.insertBefore(label, flashWrap);
			
			//hover
			util.event.bind(wrap, 'mouseover', function(e){
				e.cancelBubble = true;
				e.returnValue = false;
				
				util.addClass(wrap, CSS.HOVER);
			});
			util.event.bind(wrap, 'mouseout', function(e){
				e.cancelBubble = true;
				e.returnValue = false;
				
				util.removeClass(wrap, CSS.HOVER);
			});
			
			this.elems.text = label;
		},
		////////Methods
		startUpload: function(){
			this.ready(function(){
				this.instance.startUpload();
			});
			
			return this;
		},
		cancelUpload: function(callback){
			this.ready(function(){
				if(util.type(callback) === 'function'){
					this.one('uploadError', callback);
				}
				
				this.instance.cancelUpload(0, true);
			});
			
			return this;
		},
		stopUpload: function(callback){
			if(util.type(callback) === 'function'){
				this.one('uploadError', callback);
			}
			
			this.instance.stopUpload();
			
			return this;
		},
		/*getFile: function(){
			return this.instance.getFile.apply(this.instance, arguments);
		},*/
		
		//////implementation methods
		getQueueFile: function(index){
			var file = this.instance.getQueueFile(index);
			return file ? new upload.File4Flash(file) : null;
		},
		////set
		setPostParam: function(params){
			this.ready(function(){
				this.instance.setPostParams(params);
			});
			
			return this;
		},
		addPostParam: function(key, value){
			this.ready(function(){
				this.instance.addPostParam(key, value);
			});
			
			return this;
		},
		removePostParam: function(key){
			this.ready(function(){
				this.instance.removePostParam(key);
			});
			
			return this;
		},
		setUploadURL: function(url){
			this.ready(function(){
				this.cfg.uploadURL = url;
				this.instance.setUploadURL(url);
			});
			
			return this;
		},
		setFilePostName: function(name){
			this.ready(function(){
				this.instance.setFilePostName(name);
			});

			return this;
		},
		//require override
		setFileTypes: function(types, description){
			this.ready(function(){
				this.cfg.fileTypes = util.convert2MimeTypes(types);
				this.instance.setFileTypes(util.convertMimeTypes(types), description || this.cfg.fileTypesDescription);
			});
			
			return this;
		},
		setFileSizeLimit: function(limit){
			this.ready(function(){
				this.cfg.sizeLimit = limit;
				this.instance.setFileSizeLimit(limit);
			});
			
			return this;
		},
		//not support now
		/*
		setFileUploadLimit: function(limit){
			this.cfg.uploadLimit = limit;
			this.instance.setFileUploadLimit(limit);
		},*/
		setFileQueueLimit: function(limit){
			this.ready(function(){
				this.cfg.queueLimit = limit;
				this.instance.setFileQueueLimit(limit);
			});
			
			return this;
		},
		__translateStatus: function(status){
			var _this = this;
			// status: ON / OFF / true / false
			// disable / able
			var type = util.type(status);
			if(type === 'string'){
				status = util.trim(status);
				if(status.length){
					status = !!upload.TURNING[status.toUpperCase()];
				}else{
					status = upload.TURNING.OFF;
				}
			}else if(type === 'undefined'){
				status = !_this._.status;
			}else{
				status = !!status;
			}
			
			return status;
		},
		turn: function(status){
			var CSS = this.cfg.css;
			status = this.__translateStatus(status);
			// TODO: switch able status
			// flash version require override
			this._.status = status;
			util[status ? 'removeClass' : 'addClass'](this.elems.holder, CSS.DISABLED);
			
			this.ready(function(){
				this.instance.setButtonDisabled(!status);
				this.instance.setButtonCursor(CURSOR[status ? 'POINTER' : 'DEFAULT']);
			});
			
			return this;
		},
		multiple: function(isMulti){
			this.ready(function(){
				this.instance.setButtonAction(SWFUpload.BUTTON_ACTION[isMulti ? 'SELECT_FILES' : 'SELECT_FILE']);
			});
			
			return this;
		},
		_open: function(){
			//this.instance.movieElement.click();
		}
	});
}.call(FOCUS, this, document);
FOCUS.widget.Upload.__defaults__();
