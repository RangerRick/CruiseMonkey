(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[5],{

/***/ "./node_modules/@ionic/pwa-elements/dist/esm-es5/pwa-toast.entry.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@ionic/pwa-elements/dist/esm-es5/pwa-toast.entry.js ***!
  \**************************************************************************/
/*! exports provided: pwa_toast */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pwa_toast", function() { return PWAToast; });
/* harmony import */ var _core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core-0c538558.js */ "./node_modules/@ionic/pwa-elements/dist/esm-es5/core-0c538558.js");

var PWAToast = /** @class */ (function () {
    function class_1(hostRef) {
        Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["r"])(this, hostRef);
        this.duration = 2000;
        this.closing = null;
    }
    class_1.prototype.hostData = function () {
        var classes = {
            out: !!this.closing
        };
        if (this.closing !== null) {
            classes['in'] = !this.closing;
        }
        return {
            class: classes
        };
    };
    class_1.prototype.componentDidLoad = function () {
        var _this = this;
        setTimeout(function () {
            _this.closing = false;
        });
        setTimeout(function () {
            _this.close();
        }, this.duration);
    };
    class_1.prototype.close = function () {
        var _this = this;
        this.closing = true;
        setTimeout(function () {
            _this.el.parentNode.removeChild(_this.el);
        }, 1000);
    };
    class_1.prototype.__stencil_render = function () {
        return (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "wrapper" }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "toast" }, this.message)));
    };
    Object.defineProperty(class_1.prototype, "el", {
        get: function () { return Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["g"])(this); },
        enumerable: true,
        configurable: true
    });
    class_1.prototype.render = function () { return Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["H"], this.hostData(), this.__stencil_render()); };
    Object.defineProperty(class_1, "style", {
        get: function () { return ":host{position:fixed;bottom:20px;left:0;right:0;display:-ms-flexbox;display:flex;opacity:0}:host(.in){-webkit-transition:opacity .3s;transition:opacity .3s;opacity:1}:host(.out){-webkit-transition:opacity 1s;transition:opacity 1s;opacity:0}.wrapper{-ms-flex:1;flex:1;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}.toast{font-family:-apple-system,system-ui,Helvetica Neue,Roboto,sans-serif;background-color:#eee;color:#000;border-radius:5px;padding:10px 15px;font-size:14px;font-weight:500;-webkit-box-shadow:0 1px 2px rgba(0,0,0,.2);box-shadow:0 1px 2px rgba(0,0,0,.2)}"; },
        enumerable: true,
        configurable: true
    });
    return class_1;
}());



/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGlvbmljL3B3YS1lbGVtZW50cy9kaXN0L2VzbS1lczUvcHdhLXRvYXN0LmVudHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBMEY7QUFDMUY7QUFDQTtBQUNBLFFBQVEsMkRBQWdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsZ0JBQWdCLDJEQUFDLFNBQVMsbUJBQW1CLEVBQUUsMkRBQUMsU0FBUyxpQkFBaUI7QUFDMUU7QUFDQTtBQUNBLDBCQUEwQixRQUFRLDJEQUFVLE9BQU8sRUFBRTtBQUNyRDtBQUNBO0FBQ0EsS0FBSztBQUNMLDRDQUE0QyxRQUFRLDJEQUFDLENBQUMsbURBQUksNENBQTRDO0FBQ3RHO0FBQ0EsMEJBQTBCLGVBQWUsZUFBZSxZQUFZLE9BQU8sUUFBUSxvQkFBb0IsYUFBYSxVQUFVLFdBQVcsK0JBQStCLHVCQUF1QixVQUFVLFlBQVksOEJBQThCLHNCQUFzQixVQUFVLFNBQVMsV0FBVyxPQUFPLG9CQUFvQixhQUFhLHNCQUFzQixtQkFBbUIscUJBQXFCLHVCQUF1QixPQUFPLHFFQUFxRSxzQkFBc0IsV0FBVyxrQkFBa0Isa0JBQWtCLGVBQWUsZ0JBQWdCLDRDQUE0QyxvQ0FBb0MsRUFBRSxFQUFFO0FBQ3hxQjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQztBQUNnQyIsImZpbGUiOiI1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgciBhcyByZWdpc3Rlckluc3RhbmNlLCBoLCBnIGFzIGdldEVsZW1lbnQsIEggYXMgSG9zdCB9IGZyb20gJy4vY29yZS0wYzUzODU1OC5qcyc7XG52YXIgUFdBVG9hc3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gY2xhc3NfMShob3N0UmVmKSB7XG4gICAgICAgIHJlZ2lzdGVySW5zdGFuY2UodGhpcywgaG9zdFJlZik7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSAyMDAwO1xuICAgICAgICB0aGlzLmNsb3NpbmcgPSBudWxsO1xuICAgIH1cbiAgICBjbGFzc18xLnByb3RvdHlwZS5ob3N0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICAgICAgICBvdXQ6ICEhdGhpcy5jbG9zaW5nXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmNsb3NpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNsYXNzZXNbJ2luJ10gPSAhdGhpcy5jbG9zaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjbGFzczogY2xhc3Nlc1xuICAgICAgICB9O1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuY29tcG9uZW50RGlkTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5jbG9zaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgIH0sIHRoaXMuZHVyYXRpb24pO1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2xvc2luZyA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChfdGhpcy5lbCk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuX19zdGVuY2lsX3JlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChoKFwiZGl2XCIsIHsgY2xhc3M6IFwid3JhcHBlclwiIH0sIGgoXCJkaXZcIiwgeyBjbGFzczogXCJ0b2FzdFwiIH0sIHRoaXMubWVzc2FnZSkpKTtcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGFzc18xLnByb3RvdHlwZSwgXCJlbFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZ2V0RWxlbWVudCh0aGlzKTsgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgY2xhc3NfMS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaChIb3N0LCB0aGlzLmhvc3REYXRhKCksIHRoaXMuX19zdGVuY2lsX3JlbmRlcigpKTsgfTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhc3NfMSwgXCJzdHlsZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gXCI6aG9zdHtwb3NpdGlvbjpmaXhlZDtib3R0b206MjBweDtsZWZ0OjA7cmlnaHQ6MDtkaXNwbGF5Oi1tcy1mbGV4Ym94O2Rpc3BsYXk6ZmxleDtvcGFjaXR5OjB9Omhvc3QoLmluKXstd2Via2l0LXRyYW5zaXRpb246b3BhY2l0eSAuM3M7dHJhbnNpdGlvbjpvcGFjaXR5IC4zcztvcGFjaXR5OjF9Omhvc3QoLm91dCl7LXdlYmtpdC10cmFuc2l0aW9uOm9wYWNpdHkgMXM7dHJhbnNpdGlvbjpvcGFjaXR5IDFzO29wYWNpdHk6MH0ud3JhcHBlcnstbXMtZmxleDoxO2ZsZXg6MTtkaXNwbGF5Oi1tcy1mbGV4Ym94O2Rpc3BsYXk6ZmxleDstbXMtZmxleC1hbGlnbjpjZW50ZXI7YWxpZ24taXRlbXM6Y2VudGVyOy1tcy1mbGV4LXBhY2s6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXJ9LnRvYXN0e2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sc3lzdGVtLXVpLEhlbHZldGljYSBOZXVlLFJvYm90byxzYW5zLXNlcmlmO2JhY2tncm91bmQtY29sb3I6I2VlZTtjb2xvcjojMDAwO2JvcmRlci1yYWRpdXM6NXB4O3BhZGRpbmc6MTBweCAxNXB4O2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjUwMDstd2Via2l0LWJveC1zaGFkb3c6MCAxcHggMnB4IHJnYmEoMCwwLDAsLjIpO2JveC1zaGFkb3c6MCAxcHggMnB4IHJnYmEoMCwwLDAsLjIpfVwiOyB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gY2xhc3NfMTtcbn0oKSk7XG5leHBvcnQgeyBQV0FUb2FzdCBhcyBwd2FfdG9hc3QgfTtcbiJdLCJzb3VyY2VSb290IjoiIn0=