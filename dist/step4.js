/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _observer = __webpack_require__(8);

	var _watcher = __webpack_require__(10);

	var data = {
	  name: 'Luna',
	  phone: '18910008888',
	  address: {
	    province: '北京',
	    city: '北京',
	    street: ''
	  }
	};

	var ob = new _observer.Observer(data);

	var watcher1 = new _watcher.Watcher(data, 'name', function (name, oldName) {
	  console.log('watcher1: Name changed from "' + oldName + '" to "' + name + '"');
	});

	var watcher2 = new _watcher.Watcher(data, 'address.city', function (city, oldCity) {
	  console.log('watcher2: City changed from "' + oldCity + '" to "' + city + '"');
	});

	var watcher3 = new _watcher.Watcher(data, function () {
	  return 'My name is ' + this.name + ', come from ' + this.address.city;
	}, function (greeting, oldGreeting) {
	  console.log('watcher3: Greeting changed from "' + oldGreeting + '" to "' + greeting + '"');
	});

	var watcher4 = new _watcher.Watcher(data, function () {
	  return this.address;
	}, function (addr, oldAddr) {
	  console.log('watcher4: address changed from "' + JSON.stringify(oldAddr) + '"\n   to "' + JSON.stringify(addr) + '"');
	});

	data.name = 'Lina';

	data.address.city = "上海";

	window.data = data;

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Observer = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.defineReactive = defineReactive;
	exports.observe = observe;

	var _dep = __webpack_require__(9);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Observer = exports.Observer = function () {
	  function Observer(value) {
	    _classCallCheck(this, Observer);

	    this.value = value;
	    // 标记value已被Observer监控
	    Object.defineProperty(value, '__ob__', {
	      value: this,
	      enumerable: false,
	      configurable: true,
	      writable: true
	    });
	    this.walk(value);
	  }

	  _createClass(Observer, [{
	    key: 'walk',
	    value: function walk(obj) {
	      var keys = Object.keys(obj);
	      for (var i = 0; i < keys.length; i++) {
	        defineReactive(obj, keys[i], obj[keys[i]]);
	      }
	    }
	  }]);

	  return Observer;
	}();

	function defineReactive(obj, key, value) {
	  var childOb = observe(value);
	  var dep = new _dep.Dep();

	  Object.defineProperty(obj, key, {
	    configurable: true,
	    enumerable: true,
	    get: function get() {
	      if (_dep.Dep.target) {
	        dep.addSub(_dep.Dep.target);
	      }
	      return value;
	    },
	    set: function set(newValue) {
	      if (newValue === value) return;

	      value = newValue;
	      // 新的值可能是一个对象, 我们需要对新对象进行监控
	      childOb = observe(newValue);

	      dep.notify();
	    }
	  });
	}

	function observe(obj) {
	  if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) != 'object') {
	    return;
	  }
	  if (obj.hasOwnProperty('__ob__') && obj.__ob__ instanceof Observer) {
	    return obj.__ob__;
	  }
	  return new Observer(obj);
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.pushTarget = pushTarget;
	exports.popTarget = popTarget;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Dep = exports.Dep = function () {
	  function Dep() {
	    _classCallCheck(this, Dep);

	    this.subs = [];
	  }

	  _createClass(Dep, [{
	    key: "addSub",
	    value: function addSub(sub) {
	      this.subs.push(sub);
	    }
	  }, {
	    key: "removeSub",
	    value: function removeSub(sub) {
	      var index = this.subs.findIndex(function (s) {
	        return s === sub;
	      });
	      if (index > -1) {
	        this.subs.splice(index, 1);
	      }
	    }
	  }, {
	    key: "notify",
	    value: function notify() {
	      this.subs.forEach(function (sub) {
	        return sub.update();
	      });
	    }
	  }]);

	  return Dep;
	}();

	Dep.target = null;
	var targetStack = [];

	function pushTarget(target) {
	  if (Dep.target) targetStack.push(target);
	  Dep.target = target;
	}
	function popTarget() {
	  Dep.target = targetStack.pop();
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Watcher = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.parsePath = parsePath;

	var _dep = __webpack_require__(9);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Watcher = exports.Watcher = function () {
	  function Watcher(vm, expOrFn, cb) {
	    _classCallCheck(this, Watcher);

	    this.vm = vm;
	    this.cb = cb;
	    if (typeof expOrFn == 'function') {
	      this.getter = expOrFn;
	    } else {
	      this.getter = parsePath(expOrFn);
	    }
	    this.value = this.get();
	  }

	  _createClass(Watcher, [{
	    key: 'get',
	    value: function get() {
	      (0, _dep.pushTarget)(this);
	      var value = this.getter.call(this.vm, this.vm);
	      (0, _dep.popTarget)();
	      return value;
	    }
	  }, {
	    key: 'update',
	    value: function update() {
	      this.run();
	    }
	  }, {
	    key: 'run',
	    value: function run() {
	      var oldValue = this.value;
	      var value = this.get();
	      this.value = value;
	      if (oldValue !== value) {
	        this.cb.call(this.vm, value, oldValue);
	      }
	    }
	  }]);

	  return Watcher;
	}();

	/**
	 * Parse simple path.
	 */


	var bailRE = /[^\w.$]/;
	function parsePath(path) {
	  if (bailRE.test(path)) {
	    return;
	  } else {
	    var _ret = function () {
	      var segments = path.split('.');
	      return {
	        v: function v(obj) {
	          for (var i = 0; i < segments.length; i++) {
	            if (!obj) return;
	            obj = obj[segments[i]];
	          }
	          return obj;
	        }
	      };
	    }();

	    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	  }
	}

/***/ }
/******/ ]);