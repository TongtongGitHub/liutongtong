/**
 * @name Clazz
 * @version 0.3.2
 */
var Lass = window.Lass || {};
void function() {
	var b = this.util = this.util || {};
	b.type = function(b) {
		var f, g = /\{\s*\[native\s*code\]\s*\}/i;
		null === b ? f = "null" : "undefined" === typeof b ? f = "undefined" : (f = Object.prototype.toString.call(b).match(/\w+/g)[1].toLowerCase(), "object" === f && g.test(b + "") && (f = "function"));
		return f
	};
	b.trim = function(b) {
		return (b + "").replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, "")
	};
	b.extend = function() {
		var h = arguments.callee,
			f, g;
		"object" !== b.type(arguments[0]) ? (f = 1, g = !!arguments[0]) : (f = 0, g = !1);
		var d = arguments[f] || {};
		f = [].slice.call(arguments,
			f + 1);
		for (var a, c; f.length;)
			if (a = f.shift(), "object" === b.type(a)) {
				var e, l;
				for (l in a)
					if (e = a[l], "object" === b.type(e))
						if (e == window || e == document || "childNodes" in e && "nextSibling" in e && "nodeType" in e) {
							if (g || !(l in d)) d[l] = e
						} else if (e.jquery && /^[\d\.]+$/.test(e.jquery)) d[l] = e;
				else {
					c = b.type(d[l]);
					if (!(l in d) || "undefined" === c || "null" === c) d[l] = {};
					"object" === b.type(d[l]) && h(g, d[l], e)
				} else if (g || !(l in d)) d[l] = e
			}
		return d
	};
	b.console = b.console || function(h) {
		var f = !0,
			g = {
				turn: function(b) {
					f = !!b
				},
				warn: function() {}
			};
		return !h ? g : b.extend(!0, g, {
			warn: function(b) {
				f && h.warn(b)
			}
		})
	}.call(window, window.console);
	b.indexOf = function(h, f, g) {
		var d = -1;
		g = ("number" === b.type(g) ? g : -1) + 1;
		for (var a = h.length; g < a; g++)
			if (h[g] === f) {
				d = g;
				break
			}
		return d
	};
	return b
}.call(Lass);
void function() {
	var b = this.util,
		h = function() {},
		f = {
			impl: function(d, a) {
				"function" === b.type(a) && (this[d] = a)
			},
			mix: function() {
				b.extend.apply(null, [!0, this].concat([].slice.call(arguments)))
			}
		},
		g = function(d, a) {
			a = a || "impl super mix __getDefaultConfig __proto__ toString valueOf".split(" ");
			var c = b.extend(!0, {}, d);
			try {
				for (var e = 0; e < a.length; e++) delete c[a[e]]
			} catch (f) {}
			return c
		},
		d = function(a, d) {
			var c = {},
				e = g(a),
				f;
			for (f in e) f in d && "function" === b.type(d[f]) && (c[f] = d[f]);
			return c
		},
		a = function() {
			for (var a, c, q,
					m = [], k = 0; 3 > k; k++) m.push(b.type(arguments[k]));
			k = b.indexOf(m, "function");
			q = -1 === k ? h : arguments[k];
			for (k = -1; - 1 !== (k = b.indexOf(m, "object", k)) && !(!a && arguments[k].constructor === e ? a = arguments[k] : c || (c = arguments[k]), a && c););
			a || (a = {});
			c || (c = {});
			var s = c.config || {},
				r = [],
				p = c.inherit || h;
			c = c.mix || [{}];
			m = b.type(c);
			"object" === m ? c = [c] : "array" !== m && (c = [{}]);
			for (k = 0; k < c.length; k++) "object" === b.type(c[k]) && r.push(c[k]);
			c = null;
			var n = function() {
				var c = d(p.prototype, this);
				this["super"] = b.extend(!0, {}, p.prototype, c);
				p.apply(this["super"], [].slice.call(arguments));
				c = g(this["super"]);
				b.extend(!0, this, c, {
					__getDefaultConfig: function() {
						return s
					}
				});
				this.mix.apply(this, r);
				for (var e in a) "function" === b.type(this[e]) && this[e].__IS_ABSTRACT_METHOD__ && (this[e] = function(c) {
					var b = function() {
						a[c]()
					};
					b.__IS_ABSTRACT_METHOD__ = a[c].__IS_ABSTRACT_METHOD__;
					var d = this;
					b.impl = b.implement = function(a) {
						d.impl(c, a)
					};
					return b
				}.call(this, e));
				this.constructor = arguments.callee;
				c = q.apply(this, [].slice.call(arguments));
				for (e in a)
					if ("function" === b.type(this[e]) &&
						this[e].__IS_ABSTRACT_METHOD__) a[e]();
				if ("object" === typeof c && null !== c) return c
			};
			n.prototype = b.extend(!0, {}, f, a);
			n.extend = function(a) {
				var c = b.extend.apply(null, [!0, {}].concat([].slice.call(arguments)));
				b.extend.call(null, !0, n.prototype, c)
			};
			return n
		},
		c = this.Empty = new a,
		e = new a({
			inherit: c
		}, function(a, c) {
			var d, e;
			for (e in a) d = b.type(a[e]), "function" === d ? (this[e] = function(a, c) {
					return function() {
						c && b.console.warn(a + " method is not implement.")
					}
				}.call(this, e, c), this[e].__IS_ABSTRACT_METHOD__ = !0) : this[e] =
				"object" === d ? b.extend(!0, {}, a[e]) : a[e]
		}),
		a = {
			Clazz: a,
			Abstract: e
		};
	b.extend(!0, this, a);
	b.extend(!0, window, a)
}.call(Lass);
void function() {
	var b = this.util,
		h = function(d, a, c) {
			this.handle = d;
			this.once = !!a;
			this.data = c || {}
		},
		f = function(d, a) {
			this.type = d;
			this.data = a
		},
		g = function() {
			this._ || (this._ = {});
			this._.events = {}
		};
	g.prototype = {
		__initEvent: function(d) {
			this._.events[d] || (this._.events[d] = []);
			return this._.events[d]
		},
		__eventParams: function(d, a) {
			var c = b.type(d);
			"function" === c ? a = [d] : "array" === c ? a = d : "object" !== c && (d = {});
			c = b.type(a);
			"function" === c ? a = [a] : "array" !== c && (a = []);
			return {
				data: d,
				handle: a
			}
		},
		__bindEvent: function(d, a, c, e) {
			d =
				b.trim(d);
			d = this.__initEvent(d);
			a = this.__eventParams(a, c);
			for (c = 0; c < a.handle.length; c++) "function" === b.type(a.handle[c]) && d.push(new h(a.handle[c], !!e, b.extend(!0, {}, a.data)))
		},
		__search: function(d, a) {
			for (var c = -1, b = 0; b < d.length; b++)
				if (d[b].handle === a) {
					c = b;
					break
				}
			return c
		},
		on: function(b, a, c) {
			this.__bindEvent(b, a, c, !1);
			return this
		},
		one: function(b, a, c) {
			this.__bindEvent(b, a, c, !0);
			return this
		},
		off: function(d, a) {
			d = b.trim(d);
			"function" === b.type(a) && (a = [a]);
			if ("array" === b.type(a))
				for (var c = this.__initEvent(d),
						e, f = 0; f < a.length; f++) "function" === b.type(a[f]) && (e = this.__search(c, a[f]), -1 !== e && c.splice(e, 1));
			else this._.events[d] = [];
			return this
		},
		fire: function(d, a) {
			d = b.trim(d);
			a = "object" === b.type(a) && a || {};
			for (var c = this.__initEvent(d), e = [], g, h = 0; h < c.length; h++) g = c[h], g.handle.call(this, new f(d, b.extend(!0, {}, g.data, a))), g.once && e.push(g.handle);
			this.off(d, e);
			return this
		}
	};
	this.Events = g
}.call(Lass);
void function() {
	var b = this.util,
		h = this.Events,
		f = new this.Clazz({
			mix: {
				_: {},
				elems: {},
				config: {},
				setConfig: function(f) {
					return this.config = b.extend(!0, {}, this.__getDefaultConfig(), this.config, f)
				}
			},
			inherit: this.Empty
		});
	f.extend(new h);
	window.Component = this.Component = f
}.call(Lass);