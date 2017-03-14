var template = function(){
var util = {};

var hasOwnProperty = Object.prototype.hasOwnProperty;
var nativeIndexOf = Array.prototype.indexOf;
var nativeSome = Array.prototype.some;
var nativeFilter = Array.prototype.filter;
var nativeMap = Array.prototype.map;
var breaker = {};

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
					if(!(!override && (key in tar))){ //window, dom in IE, do not deep copy these.
						tar[key] = t;
					}
					
					continue;
				}
				
				if(t.jquery && /^[\d\.]+$/.test(t.jquery)){
					tar[key] = t;
					continue;
				}

				type = util.type(tar[key]);
				if(!(key in tar) || type === 'undefined' || type === 'null' || (override && (type === 'string' || type === 'number' || type === 'bool'))){
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

var each = util.each = function(obj, iterator, context) {
	if (obj == null) return;
	if ([].forEach && obj.forEach === [].forEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (var i = 0, l = obj.length; i < l; i++) {
			if (iterator.call(context, obj[i], i, obj) === breaker) return;
		}
	} else {
		for (var key in obj) {
			if (util.has(obj, key)) {
				if (iterator.call(context, obj[key], key, obj) === breaker) return;
			}
		}
	}
};

util.has = function(obj, key) {
	return hasOwnProperty.call(obj, key);
};

// Keep the identity function around for default iterators.
util.identity = function(value) {
	return value;
};

// Determine if at least one element in the object matches a truth test.
// Delegates to **ECMAScript 5**'s native `some` if available.
// Aliased as `any`.
var any = util.some = util.any = function(obj, iterator, context) {
	iterator || (iterator = util.identity);
	var result = false;
	if (obj == null) return result;
	if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
	each(obj, function(value, index, list) {
		if (result || (result = iterator.call(context, value, index, list))) return breaker;
	});
	return !!result;
};

// Return the first value which passes a truth test. Aliased as `detect`.
util.find = util.detect = function(obj, iterator, context) {
	var result;
	any(obj, function(value, index, list) {
		if (iterator.call(context, value, index, list)) {
			result = value;
			return true;
		}
	});
	return result;
};

// Determine if the array or object contains a given value (using `===`).
// Aliased as `include`.
util.contains = util.include = function(obj, target) {
	if (obj == null) return false;
	if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
	return any(obj, function(value) {
		return value === target;
	});
};

// Return all the elements that pass a truth test.
// Delegates to **ECMAScript 5**'s native `filter` if available.
// Aliased as `select`.
util.filter = util.select = function(obj, iterator, context) {
	var results = [];
	if (obj == null) return results;
	if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
	each(obj, function(value, index, list) {
		if (iterator.call(context, value, index, list)) results[results.length] = value;
	});
	return results;
};

// Return the results of applying the iterator to each element.
// Delegates to **ECMAScript 5**'s native `map` if available.
util.map = util.collect = function(obj, iterator, context) {
	var results = [];
	if (obj == null) return results;
	if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
	each(obj, function(value, index, list) {
		results[results.length] = iterator.call(context, value, index, list);
	});
	return results;
};

util.invert = function(obj) {
	var result = {};
	for (var key in obj) if (util.has(obj, key)) result[obj[key]] = key;
	return result;
};

util.keys = Object.keys || function(obj) {
	if (obj !== Object(obj)) throw new TypeError('Invalid object');
	var keys = [];
	for (var key in obj) if (util.has(obj, key)) keys[keys.length] = key;
	return keys;
};

// Retrieve the values of an object's properties.
util.values = function(obj) {
	var values = [];
	for (var key in obj) if (util.has(obj, key)) values.push(obj[key]);
	return values;
};

// Return a random integer between min and max (inclusive).
util.random = function(min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}
	return min + Math.floor(Math.random() * (max - min + 1));
};

// List of HTML entities for escaping.
var entityMap = {
	escape: {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'/': '&#x2F;'
	}
};

entityMap.unescape = util.invert(entityMap.escape);

// Regexes containing the keys and values listed immediately above.
var entityRegexes = {
	escape:	 new RegExp('[' + util.keys(entityMap.escape).join('') + ']', 'g'),
		unescape: new RegExp('(' + util.keys(entityMap.unescape).join('|') + ')', 'g')
};

// Functions for escaping and unescaping strings to/from HTML interpolation.
// Functions for escaping and unescaping strings to/from HTML interpolation.
util.each(['escape', 'unescape'], function(method) {
	util[method] = function(string) {
		if (string == null) return '';
		return ('' + string).replace(entityRegexes[method], function(match) {
			return entityMap[method][match];
		});
	};
});

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
var templateSettings = {
	evaluate		: /{{([\s\S]+?)}}/g,
	interpolate		: /{{=([\s\S]+?)}}/g,
	escape			: /{{-([\s\S]+?)}}/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
	"'":		"'",
	'\\':		'\\',
	'\r':		'r',
	'\n':		'n',
	'\t':		't',
	'\u2028':	'u2028',
	'\u2029':	'u2029'
};

var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
var template = function(text, data, settings) {
	var render;
	settings = util.extend(true, {}, templateSettings, settings);

	// Combine delimiters into one regular expression via alternation.
	var matcher = new RegExp([
		(settings.escape || noMatch).source,
		(settings.interpolate || noMatch).source,
		(settings.evaluate || noMatch).source
	].join('|') + '|$', 'g');

	// Compile the template source, escaping string literals appropriately.
	var index = 0;
	var source = "__p+='";
	text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
		source += text.slice(index, offset)
			.replace(escaper, function(match) { return '\\' + escapes[match]; });

		if (escape) {
			source += "'+\n((__t=(" + escape + "))==null?'':util.escape(__t))+\n'";
		}
		if (interpolate) {
			source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
		}
		if (evaluate) {
			source += "';\n" + evaluate + "\n__p+='";
		}
		index = offset + match.length;
		return match;
	});
	source += "';\n";

	// If a variable is not specified, place data values in local scope.
	if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	source = "var __t,__p='',__j=Array.prototype.join," +
		"print=function(){__p+=__j.call(arguments,'');};\n" +
		source + "return __p;\n";

	try {
		render = new Function(settings.variable || 'obj', 'util', source);
	} catch (e) {
		e.source = source;
		throw e;
	}

	if (data) return render(data, util);
	var template = function(data) {
		return render.call(this, data, util);
	};

	// Provide the compiled function source as a convenience for precompilation.
	template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

	return template;
};

template.util = util;
template.entities = entityMap;
template.settings = templateSettings;

return template;

}.call(this);