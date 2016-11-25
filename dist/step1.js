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

	var _observer = __webpack_require__(3);

	var uid = 0;
	var obj = {
	  a: 1,
	  b: 2,
	  c: {
	    name: 'Luna',
	    id: uid++
	  }
	};

	var ob = new _observer.Observer(obj);

	obj.a = 10;

	obj.c.name = 'Lina';

	// 新添加的对象将被监控
	obj.b = {
	  name: 'Akasha',
	  id: uid++
	};
	obj.b.name = 'Mirana';

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.defineReactive = defineReactive;
	exports.observe = observe;

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
	  Object.defineProperty(obj, key, {
	    configurable: true,
	    enumerable: true,
	    get: function get() {
	      return value;
	    },
	    set: function set(newValue) {
	      if (newValue === value) return;
	      var oldValue = value;
	      value = newValue;
	      // 新的值可能是一个对象, 我们需要对新对象进行监控
	      childOb = observe(newValue);

	      //todo 数据变化通知
	      console.log('old: ' + toString(oldValue) + '\nnew: ' + toString(newValue));
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

	function toString(val) {
	  return val == null ? '' : (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' ? JSON.stringify(val, null, 2) : String(val);
	}

/***/ }
/******/ ]);