/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./fixture/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./fixture/index.js":
/*!**************************!*\
  !*** ./fixture/index.js ***!
  \**************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _mock_fusion_css_fusionPrefix_my_prefix_styleContainer_my_style_container__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mock-fusion.css?fusionPrefix=.my-prefix-&styleContainer=my-style-container */ \"./fixture/mock-fusion.css?fusionPrefix=.my-prefix-&styleContainer=my-style-container\");\n/* harmony import */ var _mock_var_css_fusionVarScope_my_var_container__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mock-var.css?fusionVarScope=.my-var-container */ \"./fixture/mock-var.css?fusionVarScope=.my-var-container\");\n/* harmony import */ var _mock_custom_var_css_myCustomFusionModify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mock-custom-var.css?myCustomFusionModify */ \"./fixture/mock-custom-var.css?myCustomFusionModify\");\n/* harmony import */ var _mock_fusion_icon_css_fusionPrefix_my_prefix___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mock-fusion-icon.css?fusionPrefix=.my-prefix- */ \"./fixture/mock-fusion-icon.css?fusionPrefix=.my-prefix-\");\n\n\n\n\n\n\n//# sourceURL=webpack:///./fixture/index.js?");

/***/ }),

/***/ "./fixture/mock-custom-var.css?myCustomFusionModify":
/*!**********************************************************!*\
  !*** ./fixture/mock-custom-var.css?myCustomFusionModify ***!
  \**********************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack:///./fixture/mock-custom-var.css?");

/***/ }),

/***/ "./fixture/mock-fusion-icon.css?fusionPrefix=.my-prefix-":
/*!***************************************************************!*\
  !*** ./fixture/mock-fusion-icon.css?fusionPrefix=.my-prefix- ***!
  \***************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack:///./fixture/mock-fusion-icon.css?");

/***/ }),

/***/ "./fixture/mock-fusion.css?fusionPrefix=.my-prefix-&styleContainer=my-style-container":
/*!********************************************************************************************!*\
  !*** ./fixture/mock-fusion.css?fusionPrefix=.my-prefix-&styleContainer=my-style-container ***!
  \********************************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack:///./fixture/mock-fusion.css?");

/***/ }),

/***/ "./fixture/mock-var.css?fusionVarScope=.my-var-container":
/*!***************************************************************!*\
  !*** ./fixture/mock-var.css?fusionVarScope=.my-var-container ***!
  \***************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack:///./fixture/mock-var.css?");

/***/ })

/******/ });