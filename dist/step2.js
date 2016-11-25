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

	var _observer = __webpack_require__(4);

	var _dep = __webpack_require__(5);

	var dep = new _dep.Dep();
	var sub1 = {
	  update: function update() {
	    console.log('update sub1...');
	  }
	};
	var sub2 = {
	  update: function update() {
	    console.log('update sub2...');
	  }
	};

	dep.addSub(sub1);
	dep.addSub(sub2);

	dep.notify();

	dep.removeSub(sub1);
	dep.notify();

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
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

	var _dep = __webpack_require__(5);

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
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

/***/ }
/******/ ]);