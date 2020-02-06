(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[4],{

/***/ "./node_modules/@ionic/pwa-elements/dist/esm-es5/pwa-camera.entry.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@ionic/pwa-elements/dist/esm-es5/pwa-camera.entry.js ***!
  \***************************************************************************/
/*! exports provided: pwa_camera */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pwa_camera", function() { return CameraPWA; });
/* harmony import */ var _core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core-0c538558.js */ "./node_modules/@ionic/pwa-elements/dist/esm-es5/core-0c538558.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

/**
 * MediaStream ImageCapture polyfill
 *
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ImageCapture = window.ImageCapture;
if (typeof ImageCapture === 'undefined') {
    ImageCapture = /** @class */ (function () {
        /**
         * TODO https://www.w3.org/TR/image-capture/#constructors
         *
         * @param {MediaStreamTrack} videoStreamTrack - A MediaStreamTrack of the 'video' kind
         */
        function ImageCapture(videoStreamTrack) {
            var _this = this;
            if (videoStreamTrack.kind !== 'video')
                throw new DOMException('NotSupportedError');
            this._videoStreamTrack = videoStreamTrack;
            if (!('readyState' in this._videoStreamTrack)) {
                // Polyfill for Firefox
                this._videoStreamTrack.readyState = 'live';
            }
            // MediaStream constructor not available until Chrome 55 - https://www.chromestatus.com/feature/5912172546752512
            this._previewStream = new MediaStream([videoStreamTrack]);
            this.videoElement = document.createElement('video');
            this.videoElementPlaying = new Promise(function (resolve) {
                _this.videoElement.addEventListener('playing', resolve);
            });
            if (HTMLMediaElement) {
                this.videoElement.srcObject = this._previewStream; // Safari 11 doesn't allow use of createObjectURL for MediaStream
            }
            else {
                this.videoElement.src = URL.createObjectURL(this._previewStream);
            }
            this.videoElement.muted = true;
            this.videoElement.setAttribute('playsinline', ''); // Required by Safari on iOS 11. See https://webkit.org/blog/6784
            this.videoElement.play();
            this.canvasElement = document.createElement('canvas');
            // TODO Firefox has https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
            this.canvas2dContext = this.canvasElement.getContext('2d');
        }
        Object.defineProperty(ImageCapture.prototype, "videoStreamTrack", {
            /**
             * https://w3c.github.io/mediacapture-image/index.html#dom-imagecapture-videostreamtrack
             * @return {MediaStreamTrack} The MediaStreamTrack passed into the constructor
             */
            get: function () {
                return this._videoStreamTrack;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-getphotocapabilities
         * @return {Promise<PhotoCapabilities>} Fulfilled promise with
         * [PhotoCapabilities](https://www.w3.org/TR/image-capture/#idl-def-photocapabilities)
         * object on success, rejected promise on failure
         */
        ImageCapture.prototype.getPhotoCapabilities = function () {
            return new Promise(function executorGPC(resolve, reject) {
                // TODO see https://github.com/w3c/mediacapture-image/issues/97
                var MediaSettingsRange = {
                    current: 0, min: 0, max: 0,
                };
                resolve({
                    exposureCompensation: MediaSettingsRange,
                    exposureMode: 'none',
                    fillLightMode: ['none'],
                    focusMode: 'none',
                    imageHeight: MediaSettingsRange,
                    imageWidth: MediaSettingsRange,
                    iso: MediaSettingsRange,
                    redEyeReduction: false,
                    whiteBalanceMode: 'none',
                    zoom: MediaSettingsRange,
                });
                reject(new DOMException('OperationError'));
            });
        };
        /**
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-setoptions
         * @param {Object} photoSettings - Photo settings dictionary, https://www.w3.org/TR/image-capture/#idl-def-photosettings
         * @return {Promise<void>} Fulfilled promise on success, rejected promise on failure
         */
        ImageCapture.prototype.setOptions = function (_photoSettings) {
            if (_photoSettings === void 0) { _photoSettings = {}; }
            return new Promise(function executorSO(_resolve, _reject) {
                // TODO
            });
        };
        /**
         * TODO
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-takephoto
         * @return {Promise<Blob>} Fulfilled promise with [Blob](https://www.w3.org/TR/FileAPI/#blob)
         * argument on success; rejected promise on failure
         */
        ImageCapture.prototype.takePhoto = function () {
            var self = this;
            return new Promise(function executorTP(resolve, reject) {
                // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
                // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
                if (self._videoStreamTrack.readyState !== 'live') {
                    return reject(new DOMException('InvalidStateError'));
                }
                self.videoElementPlaying.then(function () {
                    try {
                        self.canvasElement.width = self.videoElement.videoWidth;
                        self.canvasElement.height = self.videoElement.videoHeight;
                        self.canvas2dContext.drawImage(self.videoElement, 0, 0);
                        self.canvasElement.toBlob(resolve);
                    }
                    catch (error) {
                        reject(new DOMException('UnknownError'));
                    }
                });
            });
        };
        /**
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-grabframe
         * @return {Promise<ImageBitmap>} Fulfilled promise with
         * [ImageBitmap](https://www.w3.org/TR/html51/webappapis.html#webappapis-images)
         * argument on success; rejected promise on failure
         */
        ImageCapture.prototype.grabFrame = function () {
            var self = this;
            return new Promise(function executorGF(resolve, reject) {
                // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
                // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
                if (self._videoStreamTrack.readyState !== 'live') {
                    return reject(new DOMException('InvalidStateError'));
                }
                self.videoElementPlaying.then(function () {
                    try {
                        self.canvasElement.width = self.videoElement.videoWidth;
                        self.canvasElement.height = self.videoElement.videoHeight;
                        self.canvas2dContext.drawImage(self.videoElement, 0, 0);
                        // TODO polyfill https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapFactories/createImageBitmap for IE
                        resolve(window.createImageBitmap(self.canvasElement));
                    }
                    catch (error) {
                        reject(new DOMException('UnknownError'));
                    }
                });
            });
        };
        return ImageCapture;
    }());
}
window.ImageCapture = ImageCapture;
var CameraPWA = /** @class */ (function () {
    function class_1(hostRef) {
        Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["r"])(this, hostRef);
        this.facingMode = 'user';
        this.showShutterOverlay = false;
        this.flashIndex = 0;
        // Whether the device has multiple cameras (front/back)
        this.hasMultipleCameras = false;
        // Whether the device has flash support
        this.hasFlash = false;
        // Flash modes for camera
        this.flashModes = [];
        // Current flash mode
        this.flashMode = 'off';
        this.isServer = Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["d"])(this, "isServer");
    }
    class_1.prototype.componentDidLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isServer) {
                            return [2 /*return*/];
                        }
                        this.defaultConstraints = {
                            video: {
                                facingMode: this.facingMode
                            }
                        };
                        // Figure out how many cameras we have
                        return [4 /*yield*/, this.queryDevices()];
                    case 1:
                        // Figure out how many cameras we have
                        _a.sent();
                        // Initialize the camera
                        return [4 /*yield*/, this.initCamera()];
                    case 2:
                        // Initialize the camera
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.componentDidUnload = function () {
        this.stopStream();
        this.photoSrc && URL.revokeObjectURL(this.photoSrc);
    };
    class_1.prototype.hasImageCapture = function () {
        return 'ImageCapture' in window;
    };
    /**
     * Query the list of connected devices and figure out how many video inputs we have.
     */
    class_1.prototype.queryDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        this.hasMultipleCameras = devices.filter(function (d) { return d.kind == 'videoinput'; }).length > 1;
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        this.onPhoto(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.initCamera = function (constraints) {
        return __awaiter(this, void 0, void 0, function () {
            var stream, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!constraints) {
                            constraints = this.defaultConstraints;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(Object.assign({ video: true, audio: false }, constraints))];
                    case 2:
                        stream = _a.sent();
                        this.initStream(stream);
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        this.onPhoto(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.initStream = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.stream = stream;
                        this.videoElement.srcObject = stream;
                        console.log(stream.getVideoTracks()[0]);
                        if (!this.hasImageCapture()) return [3 /*break*/, 2];
                        this.imageCapture = new window.ImageCapture(stream.getVideoTracks()[0]);
                        // console.log(stream.getTracks()[0].getCapabilities());
                        return [4 /*yield*/, this.initPhotoCapabilities(this.imageCapture)];
                    case 1:
                        // console.log(stream.getTracks()[0].getCapabilities());
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Always re-render
                        this.el.forceUpdate();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.initPhotoCapabilities = function (imageCapture) {
        return __awaiter(this, void 0, void 0, function () {
            var c;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, imageCapture.getPhotoCapabilities()];
                    case 1:
                        c = _a.sent();
                        if (c.fillLightMode.length > 1) {
                            this.flashModes = c.fillLightMode.map(function (m) { return m; });
                            // Try to recall the current flash mode
                            if (this.flashMode) {
                                this.flashMode = this.flashModes[this.flashModes.indexOf(this.flashMode)] || 'off';
                                this.flashIndex = this.flashModes.indexOf(this.flashMode) || 0;
                            }
                            else {
                                this.flashIndex = 0;
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.stopStream = function () {
        this.stream && this.stream.getTracks().forEach(function (track) { return track.stop(); });
    };
    class_1.prototype.capture = function () {
        return __awaiter(this, void 0, void 0, function () {
            var photo, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasImageCapture()) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.imageCapture.takePhoto({
                                fillLightMode: this.flashModes.length > 1 ? this.flashMode : undefined
                            })];
                    case 2:
                        photo = _a.sent();
                        return [4 /*yield*/, this.flashScreen()];
                    case 3:
                        _a.sent();
                        this.promptAccept(photo);
                        return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        console.error('Unable to take photo!', e_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.promptAccept = function (photo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.photo = photo;
                this.photoSrc = URL.createObjectURL(photo);
                return [2 /*return*/];
            });
        });
    };
    class_1.prototype.rotate = function () {
        this.stopStream();
        var track = this.stream && this.stream.getTracks()[0];
        if (!track) {
            return;
        }
        var c = track.getConstraints();
        var facingMode = c.facingMode;
        if (!facingMode) {
            var c_1 = track.getCapabilities();
            facingMode = c_1.facingMode[0];
        }
        if (facingMode === 'environment') {
            this.initCamera({
                video: {
                    facingMode: 'user'
                }
            });
        }
        else {
            this.initCamera({
                video: {
                    facingMode: 'environment'
                }
            });
        }
    };
    class_1.prototype.setFlashMode = function (mode) {
        console.log('New flash mode: ', mode);
        this.flashMode = mode;
    };
    class_1.prototype.cycleFlash = function () {
        if (this.flashModes.length > 0) {
            this.flashIndex = (this.flashIndex + 1) % this.flashModes.length;
            this.setFlashMode(this.flashModes[this.flashIndex]);
        }
    };
    class_1.prototype.flashScreen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this.showShutterOverlay = true;
                        setTimeout(function () {
                            _this.showShutterOverlay = false;
                            resolve();
                        }, 100);
                    })];
            });
        });
    };
    class_1.prototype.handleShutterClick = function (_e) {
        console.log();
        this.capture();
    };
    class_1.prototype.handleRotateClick = function (_e) {
        this.rotate();
    };
    class_1.prototype.handleClose = function (_e) {
        this.onPhoto && this.onPhoto(null);
    };
    class_1.prototype.handleFlashClick = function (_e) {
        this.cycleFlash();
    };
    class_1.prototype.handleCancelPhoto = function (_e) {
        this.photo = null;
    };
    class_1.prototype.handleAcceptPhoto = function (_e) {
        this.onPhoto && this.onPhoto(this.photo);
    };
    class_1.prototype.iconExit = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Cg id='Icon_5_'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M402.2,134L378,109.8c-1.6-1.6-4.1-1.6-5.7,0L258.8,223.4c-1.6,1.6-4.1,1.6-5.7,0L139.6,109.8 c-1.6-1.6-4.1-1.6-5.7,0L109.8,134c-1.6,1.6-1.6,4.1,0,5.7l113.5,113.5c1.6,1.6,1.6,4.1,0,5.7L109.8,372.4c-1.6,1.6-1.6,4.1,0,5.7 l24.1,24.1c1.6,1.6,4.1,1.6,5.7,0l113.5-113.5c1.6-1.6,4.1-1.6,5.7,0l113.5,113.5c1.6,1.6,4.1,1.6,5.7,0l24.1-24.1 c1.6-1.6,1.6-4.1,0-5.7L288.6,258.8c-1.6-1.6-1.6-4.1,0-5.7l113.5-113.5C403.7,138.1,403.7,135.5,402.2,134z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconConfirm = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Ccircle fill='%232CD865' cx='256' cy='256' r='256'/%3E%3Cg id='Icon_1_'%3E%3Cg%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M208,301.4l-55.4-55.5c-1.5-1.5-4-1.6-5.6-0.1l-23.4,22.3c-1.6,1.6-1.7,4.1-0.1,5.7l81.6,81.4 c3.1,3.1,8.2,3.1,11.3,0l171.8-171.7c1.6-1.6,1.6-4.2-0.1-5.7l-23.4-22.3c-1.6-1.5-4.1-1.5-5.6,0.1L213.7,301.4 C212.1,303,209.6,303,208,301.4z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconReverseCamera = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M352,0H160C72,0,0,72,0,160v192c0,88,72,160,160,160h192c88,0,160-72,160-160V160C512,72,440,0,352,0z M356.7,365.8l-3.7,3.3c-27,23.2-61.4,35.9-96.8,35.9c-72.4,0-135.8-54.7-147-125.6c-0.3-1.9-2-3.3-3.9-3.3H64 c-3.3,0-5.2-3.8-3.2-6.4l61.1-81.4c1.6-2.1,4.7-2.1,6.4-0.1l63.3,81.4c2,2.6,0.2,6.5-3.2,6.5h-40.6c-2.5,0-4.5,2.4-3.9,4.8 c11.5,51.5,59.2,90.6,112.4,90.6c26.4,0,51.8-9.7,73.7-27.9l3.1-2.5c1.6-1.3,3.9-1.1,5.3,0.3l18.5,18.6 C358.5,361.6,358.4,364.3,356.7,365.8z M451.4,245.6l-61,83.5c-1.6,2.2-4.8,2.2-6.4,0.1l-63.3-83.3c-2-2.6-0.1-6.4,3.2-6.4h40.8 c2.5,0,4.4-2.3,3.9-4.8c-5.1-24.2-17.8-46.5-36.5-63.7c-21.2-19.4-48.2-30.1-76-30.1c-26.5,0-52.6,9.7-73.7,27.3l-3.1,2.5 c-1.6,1.3-3.9,1.2-5.4-0.3l-18.5-18.5c-1.6-1.6-1.5-4.3,0.2-5.9l3.5-3.1c27-23.2,61.4-35.9,96.8-35.9c38,0,73.9,13.7,101.2,38.7 c23.2,21.1,40.3,55.2,45.7,90.1c0.3,1.9,1.9,3.4,3.9,3.4h41.3C451.4,239.2,453.3,243,451.4,245.6z'/%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconRetake = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Ccircle fill='%23727A87' cx='256' cy='256' r='256'/%3E%3Cg id='Icon_5_'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M394.2,142L370,117.8c-1.6-1.6-4.1-1.6-5.7,0L258.8,223.4c-1.6,1.6-4.1,1.6-5.7,0L147.6,117.8 c-1.6-1.6-4.1-1.6-5.7,0L117.8,142c-1.6,1.6-1.6,4.1,0,5.7l105.5,105.5c1.6,1.6,1.6,4.1,0,5.7L117.8,364.4c-1.6,1.6-1.6,4.1,0,5.7 l24.1,24.1c1.6,1.6,4.1,1.6,5.7,0l105.5-105.5c1.6-1.6,4.1-1.6,5.7,0l105.5,105.5c1.6,1.6,4.1,1.6,5.7,0l24.1-24.1 c1.6-1.6,1.6-4.1,0-5.7L288.6,258.8c-1.6-1.6-1.6-4.1,0-5.7l105.5-105.5C395.7,146.1,395.7,143.5,394.2,142z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconFlashOff = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M498,483.7L42.3,28L14,56.4l149.8,149.8L91,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9c1.6,0,2.7,1.3,2.4,2.7 L197.6,507c-1,4.4,5.8,6.9,8.9,3.2l118.6-142.8L469.6,512L498,483.7z'/%3E%3Cpath class='st0' d='M449,218.2c2.5-3,0.1-7.2-3.9-7.2H301.2c-1.6,0-2.7-1.3-2.4-2.7L342.4,5c1-4.4-5.8-6.9-8.9-3.2L214.9,144.6 l161.3,161.3L449,218.2z'/%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconFlashOn = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cpath class='st0' d='M287.2,211c-1.6,0-2.7-1.3-2.4-2.7L328.4,5c1-4.4-5.8-6.9-8.9-3.2L77,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9 c1.6,0,2.7,1.3,2.4,2.7L183.6,507c-1,4.4,5.8,6.9,8.9,3.2l242.5-292c2.5-3,0.1-7.2-3.9-7.2L287.2,211L287.2,211z'/%3E%3C/svg%3E";
    };
    class_1.prototype.iconFlashAuto = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cpath class='st0' d='M287.2,211c-1.6,0-2.7-1.3-2.4-2.7L328.4,5c1-4.4-5.8-6.9-8.9-3.2L77,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9 c1.6,0,2.7,1.3,2.4,2.7L183.6,507c-1,4.4,5.8,6.9,8.9,3.2l242.5-292c2.5-3,0.1-7.2-3.9-7.2L287.2,211L287.2,211z'/%3E%3Cg%3E%3Cpath class='st0' d='M321.3,186l74-186H438l74,186h-43.5l-11.9-32.5h-80.9l-12,32.5H321.3z M415.8,47.9l-27.2,70.7h54.9l-27.2-70.7 H415.8z'/%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.render = function () {
        var _this = this;
        var videoStreamStyle = this.facingMode == "user" ? { transform: 'scaleX(-1)' } : {};
        return (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "camera-wrapper" }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "camera-header" }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("section", { class: "items" }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "item close", onClick: function (e) { return _this.handleClose(e); } }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconExit() })), Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "item flash", onClick: function (e) { return _this.handleFlashClick(e); } }, this.flashModes.length > 0 && (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null, this.flashMode == 'off' ? Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconFlashOff() }) : '', this.flashMode == 'auto' ? Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconFlashAuto() }) : '', this.flashMode == 'flash' ? Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconFlashOn() }) : ''))))), this.photo && (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "accept" }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "accept-image", style: { backgroundImage: "url(" + this.photoSrc + ")" } }))), Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "camera-video", style: { display: this.photo ? 'none' : '' } }, this.showShutterOverlay && (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "shutter-overlay" })), this.hasImageCapture() ? (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("video", { style: videoStreamStyle, ref: function (el) { return _this.videoElement = el; }, autoplay: true, playsinline: true })) : (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("canvas", { ref: function (el) { return _this.canvasElement = el; }, width: "100%", height: "100%" })), Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("canvas", { class: "offscreen-image-render", ref: function (e) { return _this.offscreenCanvas = e; }, width: "100%", height: "100%" })), Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "camera-footer" }, !this.photo ? ([
            Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "shutter", onClick: function (e) { return _this.handleShutterClick(e); } }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "shutter-button" })),
            Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "rotate", onClick: function (e) { return _this.handleRotateClick(e); } }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconReverseCamera() })),
            { /*this.hasMultipleCameras && (<div class="item rotate" onClick={(e) => this.handleRotateClick(e)}></div>)*/}
        ]) : (Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("section", { class: "items" }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "item accept-cancel", onClick: function (e) { return _this.handleCancelPhoto(e); } }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconRetake() })), Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { class: "item accept-use", onClick: function (e) { return _this.handleAcceptPhoto(e); } }, Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: this.iconConfirm() })))))));
    };
    Object.defineProperty(class_1, "assetsDirs", {
        get: function () { return ["icons"]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "el", {
        get: function () { return Object(_core_0c538558_js__WEBPACK_IMPORTED_MODULE_0__["g"])(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(class_1, "style", {
        get: function () { return ":host{--header-height:4em;--footer-height:9em;--shutter-size:6em;--icon-size-header:1.5em;--icon-size-footer:2.5em;--margin-size-header:1.5em;--margin-size-footer:2.0em;font-family:-apple-system,BlinkMacSystemFont,“Segoe UI”,“Roboto”,“Droid Sans”,“Helvetica Neue”,sans-serif;display:block}.items,:host{width:100%;height:100%}.items{-webkit-box-sizing:border-box;box-sizing:border-box;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}.items .item{-ms-flex:1;flex:1;text-align:center}.items .item:first-child{text-align:left}.items .item:last-child{text-align:right}.camera-wrapper{position:relative;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;width:100%;height:100%}.camera-header{color:#fff;background-color:#000;height:var(--header-height)}.camera-header .items{padding:var(--margin-size-header)}.camera-footer{position:relative;color:#fff;background-color:#000;height:var(--footer-height)}.camera-footer .items{padding:var(--margin-size-footer)}.camera-video{position:relative;-ms-flex:1;flex:1;overflow:hidden}.camera-video,video{background-color:#000}video{width:100%;height:100%;max-height:100%;min-height:100%;-o-object-fit:cover;object-fit:cover}.shutter{position:absolute;left:50%;top:50%;width:var(--shutter-size);height:var(--shutter-size);margin-top:calc(var(--shutter-size) / -2);margin-left:calc(var(--shutter-size) / -2);border-radius:100%;background-color:#c6cdd8;padding:12px;-webkit-box-sizing:border-box;box-sizing:border-box}.shutter:active .shutter-button{background-color:#9da9bb}.shutter-button{background-color:#fff;border-radius:100%;width:100%;height:100%}.rotate{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;position:absolute;right:var(--margin-size-footer);top:0;height:100%;color:#fff}.rotate,.rotate img{width:var(--icon-size-footer)}.rotate img{height:var(--icon-size-footer)}.shutter-overlay{z-index:5;position:absolute;width:100%;height:100%;background-color:#000}.error{width:100%;height:100%;color:#fff;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center}.accept{background-color:#000;-ms-flex:1;flex:1}.accept .accept-image{width:100%;height:100%;background-position:50%;background-size:cover;background-repeat:no-repeat}.close img,.flash img{width:var(--icon-size-header);height:var(--icon-size-header)}.accept-cancel img,.accept-use img{width:var(--icon-size-footer);height:var(--icon-size-footer)}.offscreen-image-render{top:0;left:0;visibility:hidden;pointer-events:none;width:100%;height:100%}"; },
        enumerable: true,
        configurable: true
    });
    return class_1;
}());



/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGlvbmljL3B3YS1lbGVtZW50cy9kaXN0L2VzbS1lczUvcHdhLWNhbWVyYS5lbnRyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQWlCLFNBQUksSUFBSSxTQUFJO0FBQzdCO0FBQ0EsbUNBQW1DLE1BQU0sNkJBQTZCLEVBQUUsWUFBWSxXQUFXLEVBQUU7QUFDakcsa0NBQWtDLE1BQU0saUNBQWlDLEVBQUUsWUFBWSxXQUFXLEVBQUU7QUFDcEcsK0JBQStCLGlFQUFpRSx1QkFBdUIsRUFBRSw0QkFBNEI7QUFDcko7QUFDQSxLQUFLO0FBQ0w7QUFDQSxtQkFBbUIsU0FBSSxJQUFJLFNBQUk7QUFDL0IsYUFBYSw2QkFBNkIsMEJBQTBCLGFBQWEsRUFBRSxxQkFBcUI7QUFDeEcsZ0JBQWdCLHFEQUFxRCxvRUFBb0UsYUFBYSxFQUFFO0FBQ3hKLHNCQUFzQixzQkFBc0IscUJBQXFCLEdBQUc7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDLGtDQUFrQyxTQUFTO0FBQzNDLGtDQUFrQyxXQUFXLFVBQVU7QUFDdkQseUNBQXlDLGNBQWM7QUFDdkQ7QUFDQSw2R0FBNkcsT0FBTyxVQUFVO0FBQzlILGdGQUFnRixpQkFBaUIsT0FBTztBQUN4Ryx3REFBd0QsZ0JBQWdCLFFBQVEsT0FBTztBQUN2Riw4Q0FBOEMsZ0JBQWdCLGdCQUFnQixPQUFPO0FBQ3JGO0FBQ0EsaUNBQWlDO0FBQ2pDO0FBQ0E7QUFDQSxTQUFTLFlBQVksYUFBYSxPQUFPLEVBQUUsVUFBVSxXQUFXO0FBQ2hFLG1DQUFtQyxTQUFTO0FBQzVDO0FBQ0E7QUFDZ0c7QUFDaEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0EsQ0FBQztBQUNrQyIsImZpbGUiOiI0LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShyZXN1bHQudmFsdWUpOyB9KS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmltcG9ydCB7IHIgYXMgcmVnaXN0ZXJJbnN0YW5jZSwgZCBhcyBnZXRDb250ZXh0LCBoLCBnIGFzIGdldEVsZW1lbnQgfSBmcm9tICcuL2NvcmUtMGM1Mzg1NTguanMnO1xuLyoqXG4gKiBNZWRpYVN0cmVhbSBJbWFnZUNhcHR1cmUgcG9seWZpbGxcbiAqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTggR29vZ2xlIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG52YXIgSW1hZ2VDYXB0dXJlID0gd2luZG93LkltYWdlQ2FwdHVyZTtcbmlmICh0eXBlb2YgSW1hZ2VDYXB0dXJlID09PSAndW5kZWZpbmVkJykge1xuICAgIEltYWdlQ2FwdHVyZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRPRE8gaHR0cHM6Ly93d3cudzMub3JnL1RSL2ltYWdlLWNhcHR1cmUvI2NvbnN0cnVjdG9yc1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge01lZGlhU3RyZWFtVHJhY2t9IHZpZGVvU3RyZWFtVHJhY2sgLSBBIE1lZGlhU3RyZWFtVHJhY2sgb2YgdGhlICd2aWRlbycga2luZFxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gSW1hZ2VDYXB0dXJlKHZpZGVvU3RyZWFtVHJhY2spIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodmlkZW9TdHJlYW1UcmFjay5raW5kICE9PSAndmlkZW8nKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ05vdFN1cHBvcnRlZEVycm9yJyk7XG4gICAgICAgICAgICB0aGlzLl92aWRlb1N0cmVhbVRyYWNrID0gdmlkZW9TdHJlYW1UcmFjaztcbiAgICAgICAgICAgIGlmICghKCdyZWFkeVN0YXRlJyBpbiB0aGlzLl92aWRlb1N0cmVhbVRyYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIFBvbHlmaWxsIGZvciBGaXJlZm94XG4gICAgICAgICAgICAgICAgdGhpcy5fdmlkZW9TdHJlYW1UcmFjay5yZWFkeVN0YXRlID0gJ2xpdmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWVkaWFTdHJlYW0gY29uc3RydWN0b3Igbm90IGF2YWlsYWJsZSB1bnRpbCBDaHJvbWUgNTUgLSBodHRwczovL3d3dy5jaHJvbWVzdGF0dXMuY29tL2ZlYXR1cmUvNTkxMjE3MjU0Njc1MjUxMlxuICAgICAgICAgICAgdGhpcy5fcHJldmlld1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbShbdmlkZW9TdHJlYW1UcmFja10pO1xuICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnRQbGF5aW5nID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy52aWRlb0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheWluZycsIHJlc29sdmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoSFRNTE1lZGlhRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnNyY09iamVjdCA9IHRoaXMuX3ByZXZpZXdTdHJlYW07IC8vIFNhZmFyaSAxMSBkb2Vzbid0IGFsbG93IHVzZSBvZiBjcmVhdGVPYmplY3RVUkwgZm9yIE1lZGlhU3RyZWFtXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuX3ByZXZpZXdTdHJlYW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQubXV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuc2V0QXR0cmlidXRlKCdwbGF5c2lubGluZScsICcnKTsgLy8gUmVxdWlyZWQgYnkgU2FmYXJpIG9uIGlPUyAxMS4gU2VlIGh0dHBzOi8vd2Via2l0Lm9yZy9ibG9nLzY3ODRcbiAgICAgICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgLy8gVE9ETyBGaXJlZm94IGhhcyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvT2Zmc2NyZWVuQ2FudmFzXG4gICAgICAgICAgICB0aGlzLmNhbnZhczJkQ29udGV4dCA9IHRoaXMuY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbWFnZUNhcHR1cmUucHJvdG90eXBlLCBcInZpZGVvU3RyZWFtVHJhY2tcIiwge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBodHRwczovL3czYy5naXRodWIuaW8vbWVkaWFjYXB0dXJlLWltYWdlL2luZGV4Lmh0bWwjZG9tLWltYWdlY2FwdHVyZS12aWRlb3N0cmVhbXRyYWNrXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtNZWRpYVN0cmVhbVRyYWNrfSBUaGUgTWVkaWFTdHJlYW1UcmFjayBwYXNzZWQgaW50byB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZGVvU3RyZWFtVHJhY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltcGxlbWVudHMgaHR0cHM6Ly93d3cudzMub3JnL1RSL2ltYWdlLWNhcHR1cmUvI2RvbS1pbWFnZWNhcHR1cmUtZ2V0cGhvdG9jYXBhYmlsaXRpZXNcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZTxQaG90b0NhcGFiaWxpdGllcz59IEZ1bGZpbGxlZCBwcm9taXNlIHdpdGhcbiAgICAgICAgICogW1Bob3RvQ2FwYWJpbGl0aWVzXShodHRwczovL3d3dy53My5vcmcvVFIvaW1hZ2UtY2FwdHVyZS8jaWRsLWRlZi1waG90b2NhcGFiaWxpdGllcylcbiAgICAgICAgICogb2JqZWN0IG9uIHN1Y2Nlc3MsIHJlamVjdGVkIHByb21pc2Ugb24gZmFpbHVyZVxuICAgICAgICAgKi9cbiAgICAgICAgSW1hZ2VDYXB0dXJlLnByb3RvdHlwZS5nZXRQaG90b0NhcGFiaWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvckdQQyhyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIHNlZSBodHRwczovL2dpdGh1Yi5jb20vdzNjL21lZGlhY2FwdHVyZS1pbWFnZS9pc3N1ZXMvOTdcbiAgICAgICAgICAgICAgICB2YXIgTWVkaWFTZXR0aW5nc1JhbmdlID0ge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiAwLCBtaW46IDAsIG1heDogMCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBleHBvc3VyZUNvbXBlbnNhdGlvbjogTWVkaWFTZXR0aW5nc1JhbmdlLFxuICAgICAgICAgICAgICAgICAgICBleHBvc3VyZU1vZGU6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsbExpZ2h0TW9kZTogWydub25lJ10sXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzTW9kZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZUhlaWdodDogTWVkaWFTZXR0aW5nc1JhbmdlLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVdpZHRoOiBNZWRpYVNldHRpbmdzUmFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIGlzbzogTWVkaWFTZXR0aW5nc1JhbmdlLFxuICAgICAgICAgICAgICAgICAgICByZWRFeWVSZWR1Y3Rpb246IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB3aGl0ZUJhbGFuY2VNb2RlOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICAgIHpvb206IE1lZGlhU2V0dGluZ3NSYW5nZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IERPTUV4Y2VwdGlvbignT3BlcmF0aW9uRXJyb3InKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltcGxlbWVudHMgaHR0cHM6Ly93d3cudzMub3JnL1RSL2ltYWdlLWNhcHR1cmUvI2RvbS1pbWFnZWNhcHR1cmUtc2V0b3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGhvdG9TZXR0aW5ncyAtIFBob3RvIHNldHRpbmdzIGRpY3Rpb25hcnksIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9pbWFnZS1jYXB0dXJlLyNpZGwtZGVmLXBob3Rvc2V0dGluZ3NcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZTx2b2lkPn0gRnVsZmlsbGVkIHByb21pc2Ugb24gc3VjY2VzcywgcmVqZWN0ZWQgcHJvbWlzZSBvbiBmYWlsdXJlXG4gICAgICAgICAqL1xuICAgICAgICBJbWFnZUNhcHR1cmUucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAoX3Bob3RvU2V0dGluZ3MpIHtcbiAgICAgICAgICAgIGlmIChfcGhvdG9TZXR0aW5ncyA9PT0gdm9pZCAwKSB7IF9waG90b1NldHRpbmdzID0ge307IH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvclNPKF9yZXNvbHZlLCBfcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUT0RPXG4gICAgICAgICAqIEltcGxlbWVudHMgaHR0cHM6Ly93d3cudzMub3JnL1RSL2ltYWdlLWNhcHR1cmUvI2RvbS1pbWFnZWNhcHR1cmUtdGFrZXBob3RvXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8QmxvYj59IEZ1bGZpbGxlZCBwcm9taXNlIHdpdGggW0Jsb2JdKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9GaWxlQVBJLyNibG9iKVxuICAgICAgICAgKiBhcmd1bWVudCBvbiBzdWNjZXNzOyByZWplY3RlZCBwcm9taXNlIG9uIGZhaWx1cmVcbiAgICAgICAgICovXG4gICAgICAgIEltYWdlQ2FwdHVyZS5wcm90b3R5cGUudGFrZVBob3RvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yVFAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgLy8gYElmIHRoZSByZWFkeVN0YXRlIG9mIHRoZSBNZWRpYVN0cmVhbVRyYWNrIHByb3ZpZGVkIGluIHRoZSBjb25zdHJ1Y3RvciBpcyBub3QgbGl2ZSxcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggYSBuZXcgRE9NRXhjZXB0aW9uIHdob3NlIG5hbWUgaXMgXCJJbnZhbGlkU3RhdGVFcnJvclwiLmBcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fdmlkZW9TdHJlYW1UcmFjay5yZWFkeVN0YXRlICE9PSAnbGl2ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRE9NRXhjZXB0aW9uKCdJbnZhbGlkU3RhdGVFcnJvcicpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi52aWRlb0VsZW1lbnRQbGF5aW5nLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jYW52YXNFbGVtZW50LndpZHRoID0gc2VsZi52aWRlb0VsZW1lbnQudmlkZW9XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2FudmFzRWxlbWVudC5oZWlnaHQgPSBzZWxmLnZpZGVvRWxlbWVudC52aWRlb0hlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2FudmFzMmRDb250ZXh0LmRyYXdJbWFnZShzZWxmLnZpZGVvRWxlbWVudCwgMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbnZhc0VsZW1lbnQudG9CbG9iKHJlc29sdmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBET01FeGNlcHRpb24oJ1Vua25vd25FcnJvcicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbXBsZW1lbnRzIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9pbWFnZS1jYXB0dXJlLyNkb20taW1hZ2VjYXB0dXJlLWdyYWJmcmFtZVxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEltYWdlQml0bWFwPn0gRnVsZmlsbGVkIHByb21pc2Ugd2l0aFxuICAgICAgICAgKiBbSW1hZ2VCaXRtYXBdKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNTEvd2ViYXBwYXBpcy5odG1sI3dlYmFwcGFwaXMtaW1hZ2VzKVxuICAgICAgICAgKiBhcmd1bWVudCBvbiBzdWNjZXNzOyByZWplY3RlZCBwcm9taXNlIG9uIGZhaWx1cmVcbiAgICAgICAgICovXG4gICAgICAgIEltYWdlQ2FwdHVyZS5wcm90b3R5cGUuZ3JhYkZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yR0YocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgLy8gYElmIHRoZSByZWFkeVN0YXRlIG9mIHRoZSBNZWRpYVN0cmVhbVRyYWNrIHByb3ZpZGVkIGluIHRoZSBjb25zdHJ1Y3RvciBpcyBub3QgbGl2ZSxcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggYSBuZXcgRE9NRXhjZXB0aW9uIHdob3NlIG5hbWUgaXMgXCJJbnZhbGlkU3RhdGVFcnJvclwiLmBcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fdmlkZW9TdHJlYW1UcmFjay5yZWFkeVN0YXRlICE9PSAnbGl2ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRE9NRXhjZXB0aW9uKCdJbnZhbGlkU3RhdGVFcnJvcicpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi52aWRlb0VsZW1lbnRQbGF5aW5nLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jYW52YXNFbGVtZW50LndpZHRoID0gc2VsZi52aWRlb0VsZW1lbnQudmlkZW9XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2FudmFzRWxlbWVudC5oZWlnaHQgPSBzZWxmLnZpZGVvRWxlbWVudC52aWRlb0hlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2FudmFzMmRDb250ZXh0LmRyYXdJbWFnZShzZWxmLnZpZGVvRWxlbWVudCwgMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHBvbHlmaWxsIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9JbWFnZUJpdG1hcEZhY3Rvcmllcy9jcmVhdGVJbWFnZUJpdG1hcCBmb3IgSUVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93LmNyZWF0ZUltYWdlQml0bWFwKHNlbGYuY2FudmFzRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBET01FeGNlcHRpb24oJ1Vua25vd25FcnJvcicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBJbWFnZUNhcHR1cmU7XG4gICAgfSgpKTtcbn1cbndpbmRvdy5JbWFnZUNhcHR1cmUgPSBJbWFnZUNhcHR1cmU7XG52YXIgQ2FtZXJhUFdBID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNsYXNzXzEoaG9zdFJlZikge1xuICAgICAgICByZWdpc3Rlckluc3RhbmNlKHRoaXMsIGhvc3RSZWYpO1xuICAgICAgICB0aGlzLmZhY2luZ01vZGUgPSAndXNlcic7XG4gICAgICAgIHRoaXMuc2hvd1NodXR0ZXJPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmxhc2hJbmRleCA9IDA7XG4gICAgICAgIC8vIFdoZXRoZXIgdGhlIGRldmljZSBoYXMgbXVsdGlwbGUgY2FtZXJhcyAoZnJvbnQvYmFjaylcbiAgICAgICAgdGhpcy5oYXNNdWx0aXBsZUNhbWVyYXMgPSBmYWxzZTtcbiAgICAgICAgLy8gV2hldGhlciB0aGUgZGV2aWNlIGhhcyBmbGFzaCBzdXBwb3J0XG4gICAgICAgIHRoaXMuaGFzRmxhc2ggPSBmYWxzZTtcbiAgICAgICAgLy8gRmxhc2ggbW9kZXMgZm9yIGNhbWVyYVxuICAgICAgICB0aGlzLmZsYXNoTW9kZXMgPSBbXTtcbiAgICAgICAgLy8gQ3VycmVudCBmbGFzaCBtb2RlXG4gICAgICAgIHRoaXMuZmxhc2hNb2RlID0gJ29mZic7XG4gICAgICAgIHRoaXMuaXNTZXJ2ZXIgPSBnZXRDb250ZXh0KHRoaXMsIFwiaXNTZXJ2ZXJcIik7XG4gICAgfVxuICAgIGNsYXNzXzEucHJvdG90eXBlLmNvbXBvbmVudERpZExvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VydmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0Q29uc3RyYWludHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFjaW5nTW9kZTogdGhpcy5mYWNpbmdNb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpZ3VyZSBvdXQgaG93IG1hbnkgY2FtZXJhcyB3ZSBoYXZlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnF1ZXJ5RGV2aWNlcygpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlndXJlIG91dCBob3cgbWFueSBjYW1lcmFzIHdlIGhhdmVcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGNhbWVyYVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5pbml0Q2FtZXJhKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBjYW1lcmFcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5jb21wb25lbnREaWRVbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RvcFN0cmVhbSgpO1xuICAgICAgICB0aGlzLnBob3RvU3JjICYmIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5waG90b1NyYyk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5oYXNJbWFnZUNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnSW1hZ2VDYXB0dXJlJyBpbiB3aW5kb3c7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBRdWVyeSB0aGUgbGlzdCBvZiBjb25uZWN0ZWQgZGV2aWNlcyBhbmQgZmlndXJlIG91dCBob3cgbWFueSB2aWRlbyBpbnB1dHMgd2UgaGF2ZS5cbiAgICAgKi9cbiAgICBjbGFzc18xLnByb3RvdHlwZS5xdWVyeURldmljZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXZpY2VzLCBlXzE7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS50cnlzLnB1c2goWzAsIDIsICwgM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNNdWx0aXBsZUNhbWVyYXMgPSBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5raW5kID09ICd2aWRlb2lucHV0JzsgfSkubGVuZ3RoID4gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDNdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBlXzEgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGhvdG8oZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDNdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5pbml0Q2FtZXJhID0gZnVuY3Rpb24gKGNvbnN0cmFpbnRzKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzdHJlYW0sIGVfMjtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29uc3RyYWludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJhaW50cyA9IHRoaXMuZGVmYXVsdENvbnN0cmFpbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSAxO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS50cnlzLnB1c2goWzEsIDMsICwgNF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoT2JqZWN0LmFzc2lnbih7IHZpZGVvOiB0cnVlLCBhdWRpbzogZmFsc2UgfSwgY29uc3RyYWludHMpKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdFN0cmVhbShzdHJlYW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVfMiA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25QaG90byhlXzIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmluaXRTdHJlYW0gPSBmdW5jdGlvbiAoc3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ltYWdlQ2FwdHVyZSgpKSByZXR1cm4gWzMgLypicmVhayovLCAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDYXB0dXJlID0gbmV3IHdpbmRvdy5JbWFnZUNhcHR1cmUoc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3RyZWFtLmdldFRyYWNrcygpWzBdLmdldENhcGFiaWxpdGllcygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMuaW5pdFBob3RvQ2FwYWJpbGl0aWVzKHRoaXMuaW1hZ2VDYXB0dXJlKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHN0cmVhbS5nZXRUcmFja3MoKVswXS5nZXRDYXBhYmlsaXRpZXMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDI7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsd2F5cyByZS1yZW5kZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWwuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5pbml0UGhvdG9DYXBhYmlsaXRpZXMgPSBmdW5jdGlvbiAoaW1hZ2VDYXB0dXJlKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCBpbWFnZUNhcHR1cmUuZ2V0UGhvdG9DYXBhYmlsaXRpZXMoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5maWxsTGlnaHRNb2RlLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYXNoTW9kZXMgPSBjLmZpbGxMaWdodE1vZGUubWFwKGZ1bmN0aW9uIChtKSB7IHJldHVybiBtOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnkgdG8gcmVjYWxsIHRoZSBjdXJyZW50IGZsYXNoIG1vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mbGFzaE1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbGFzaE1vZGUgPSB0aGlzLmZsYXNoTW9kZXNbdGhpcy5mbGFzaE1vZGVzLmluZGV4T2YodGhpcy5mbGFzaE1vZGUpXSB8fCAnb2ZmJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbGFzaEluZGV4ID0gdGhpcy5mbGFzaE1vZGVzLmluZGV4T2YodGhpcy5mbGFzaE1vZGUpIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYXNoSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5zdG9wU3RyZWFtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnN0cmVhbSAmJiB0aGlzLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykgeyByZXR1cm4gdHJhY2suc3RvcCgpOyB9KTtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwaG90bywgZV8zO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ltYWdlQ2FwdHVyZSgpKSByZXR1cm4gWzMgLypicmVhayovLCA1XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2EudHJ5cy5wdXNoKFsxLCA0LCAsIDVdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMuaW1hZ2VDYXB0dXJlLnRha2VQaG90byh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxMaWdodE1vZGU6IHRoaXMuZmxhc2hNb2Rlcy5sZW5ndGggPiAxID8gdGhpcy5mbGFzaE1vZGUgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5mbGFzaFNjcmVlbigpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9tcHRBY2NlcHQocGhvdG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVfMyA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byB0YWtlIHBob3RvIScsIGVfMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA1XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA1OiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUucHJvbXB0QWNjZXB0ID0gZnVuY3Rpb24gKHBob3RvKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBob3RvID0gcGhvdG87XG4gICAgICAgICAgICAgICAgdGhpcy5waG90b1NyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwocGhvdG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9wU3RyZWFtKCk7XG4gICAgICAgIHZhciB0cmFjayA9IHRoaXMuc3RyZWFtICYmIHRoaXMuc3RyZWFtLmdldFRyYWNrcygpWzBdO1xuICAgICAgICBpZiAoIXRyYWNrKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGMgPSB0cmFjay5nZXRDb25zdHJhaW50cygpO1xuICAgICAgICB2YXIgZmFjaW5nTW9kZSA9IGMuZmFjaW5nTW9kZTtcbiAgICAgICAgaWYgKCFmYWNpbmdNb2RlKSB7XG4gICAgICAgICAgICB2YXIgY18xID0gdHJhY2suZ2V0Q2FwYWJpbGl0aWVzKCk7XG4gICAgICAgICAgICBmYWNpbmdNb2RlID0gY18xLmZhY2luZ01vZGVbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZhY2luZ01vZGUgPT09ICdlbnZpcm9ubWVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdENhbWVyYSh7XG4gICAgICAgICAgICAgICAgdmlkZW86IHtcbiAgICAgICAgICAgICAgICAgICAgZmFjaW5nTW9kZTogJ3VzZXInXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmluaXRDYW1lcmEoe1xuICAgICAgICAgICAgICAgIHZpZGVvOiB7XG4gICAgICAgICAgICAgICAgICAgIGZhY2luZ01vZGU6ICdlbnZpcm9ubWVudCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuc2V0Rmxhc2hNb2RlID0gZnVuY3Rpb24gKG1vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05ldyBmbGFzaCBtb2RlOiAnLCBtb2RlKTtcbiAgICAgICAgdGhpcy5mbGFzaE1vZGUgPSBtb2RlO1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuY3ljbGVGbGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmxhc2hNb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmZsYXNoSW5kZXggPSAodGhpcy5mbGFzaEluZGV4ICsgMSkgJSB0aGlzLmZsYXNoTW9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5zZXRGbGFzaE1vZGUodGhpcy5mbGFzaE1vZGVzW3RoaXMuZmxhc2hJbmRleF0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5mbGFzaFNjcmVlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIF9yZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNob3dTaHV0dGVyT3ZlcmxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zaG93U2h1dHRlck92ZXJsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5oYW5kbGVTaHV0dGVyQ2xpY2sgPSBmdW5jdGlvbiAoX2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coKTtcbiAgICAgICAgdGhpcy5jYXB0dXJlKCk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5oYW5kbGVSb3RhdGVDbGljayA9IGZ1bmN0aW9uIChfZSkge1xuICAgICAgICB0aGlzLnJvdGF0ZSgpO1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuaGFuZGxlQ2xvc2UgPSBmdW5jdGlvbiAoX2UpIHtcbiAgICAgICAgdGhpcy5vblBob3RvICYmIHRoaXMub25QaG90byhudWxsKTtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmhhbmRsZUZsYXNoQ2xpY2sgPSBmdW5jdGlvbiAoX2UpIHtcbiAgICAgICAgdGhpcy5jeWNsZUZsYXNoKCk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5oYW5kbGVDYW5jZWxQaG90byA9IGZ1bmN0aW9uIChfZSkge1xuICAgICAgICB0aGlzLnBob3RvID0gbnVsbDtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmhhbmRsZUFjY2VwdFBob3RvID0gZnVuY3Rpb24gKF9lKSB7XG4gICAgICAgIHRoaXMub25QaG90byAmJiB0aGlzLm9uUGhvdG8odGhpcy5waG90byk7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5pY29uRXhpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiZGF0YTppbWFnZS9zdmcreG1sLCUzQ3N2ZyB2ZXJzaW9uPScxLjEnIGlkPSdMYXllcl8xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyB4PScwcHgnIHk9JzBweCcgdmlld0JveD0nMCAwIDUxMiA1MTInIGVuYWJsZS1iYWNrZ3JvdW5kPSduZXcgMCAwIDUxMiA1MTInIHhtbDpzcGFjZT0ncHJlc2VydmUnJTNFJTNDZyBpZD0nSWNvbl81XyclM0UlM0NnJTNFJTNDcGF0aCBmaWxsPSclMjNGRkZGRkYnIGQ9J000MDIuMiwxMzRMMzc4LDEwOS44Yy0xLjYtMS42LTQuMS0xLjYtNS43LDBMMjU4LjgsMjIzLjRjLTEuNiwxLjYtNC4xLDEuNi01LjcsMEwxMzkuNiwxMDkuOCBjLTEuNi0xLjYtNC4xLTEuNi01LjcsMEwxMDkuOCwxMzRjLTEuNiwxLjYtMS42LDQuMSwwLDUuN2wxMTMuNSwxMTMuNWMxLjYsMS42LDEuNiw0LjEsMCw1LjdMMTA5LjgsMzcyLjRjLTEuNiwxLjYtMS42LDQuMSwwLDUuNyBsMjQuMSwyNC4xYzEuNiwxLjYsNC4xLDEuNiw1LjcsMGwxMTMuNS0xMTMuNWMxLjYtMS42LDQuMS0xLjYsNS43LDBsMTEzLjUsMTEzLjVjMS42LDEuNiw0LjEsMS42LDUuNywwbDI0LjEtMjQuMSBjMS42LTEuNiwxLjYtNC4xLDAtNS43TDI4OC42LDI1OC44Yy0xLjYtMS42LTEuNi00LjEsMC01LjdsMTEzLjUtMTEzLjVDNDAzLjcsMTM4LjEsNDAzLjcsMTM1LjUsNDAyLjIsMTM0eicvJTNFJTNDL2clM0UlM0MvZyUzRSUzQy9zdmclM0VcIjtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmljb25Db25maXJtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHZlcnNpb249JzEuMScgaWQ9J0xheWVyXzEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHg9JzBweCcgeT0nMHB4JyB2aWV3Qm94PScwIDAgNTEyIDUxMicgZW5hYmxlLWJhY2tncm91bmQ9J25ldyAwIDAgNTEyIDUxMicgeG1sOnNwYWNlPSdwcmVzZXJ2ZSclM0UlM0NjaXJjbGUgZmlsbD0nJTIzMkNEODY1JyBjeD0nMjU2JyBjeT0nMjU2JyByPScyNTYnLyUzRSUzQ2cgaWQ9J0ljb25fMV8nJTNFJTNDZyUzRSUzQ2clM0UlM0NwYXRoIGZpbGw9JyUyM0ZGRkZGRicgZD0nTTIwOCwzMDEuNGwtNTUuNC01NS41Yy0xLjUtMS41LTQtMS42LTUuNi0wLjFsLTIzLjQsMjIuM2MtMS42LDEuNi0xLjcsNC4xLTAuMSw1LjdsODEuNiw4MS40IGMzLjEsMy4xLDguMiwzLjEsMTEuMywwbDE3MS44LTE3MS43YzEuNi0xLjYsMS42LTQuMi0wLjEtNS43bC0yMy40LTIyLjNjLTEuNi0xLjUtNC4xLTEuNS01LjYsMC4xTDIxMy43LDMwMS40IEMyMTIuMSwzMDMsMjA5LjYsMzAzLDIwOCwzMDEuNHonLyUzRSUzQy9nJTNFJTNDL2clM0UlM0MvZyUzRSUzQy9zdmclM0VcIjtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmljb25SZXZlcnNlQ2FtZXJhID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHZlcnNpb249JzEuMScgaWQ9J0xheWVyXzEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHg9JzBweCcgeT0nMHB4JyB2aWV3Qm94PScwIDAgNTEyIDUxMicgZW5hYmxlLWJhY2tncm91bmQ9J25ldyAwIDAgNTEyIDUxMicgeG1sOnNwYWNlPSdwcmVzZXJ2ZSclM0UlM0NnJTNFJTNDcGF0aCBmaWxsPSclMjNGRkZGRkYnIGQ9J00zNTIsMEgxNjBDNzIsMCwwLDcyLDAsMTYwdjE5MmMwLDg4LDcyLDE2MCwxNjAsMTYwaDE5MmM4OCwwLDE2MC03MiwxNjAtMTYwVjE2MEM1MTIsNzIsNDQwLDAsMzUyLDB6IE0zNTYuNywzNjUuOGwtMy43LDMuM2MtMjcsMjMuMi02MS40LDM1LjktOTYuOCwzNS45Yy03Mi40LDAtMTM1LjgtNTQuNy0xNDctMTI1LjZjLTAuMy0xLjktMi0zLjMtMy45LTMuM0g2NCBjLTMuMywwLTUuMi0zLjgtMy4yLTYuNGw2MS4xLTgxLjRjMS42LTIuMSw0LjctMi4xLDYuNC0wLjFsNjMuMyw4MS40YzIsMi42LDAuMiw2LjUtMy4yLDYuNWgtNDAuNmMtMi41LDAtNC41LDIuNC0zLjksNC44IGMxMS41LDUxLjUsNTkuMiw5MC42LDExMi40LDkwLjZjMjYuNCwwLDUxLjgtOS43LDczLjctMjcuOWwzLjEtMi41YzEuNi0xLjMsMy45LTEuMSw1LjMsMC4zbDE4LjUsMTguNiBDMzU4LjUsMzYxLjYsMzU4LjQsMzY0LjMsMzU2LjcsMzY1Ljh6IE00NTEuNCwyNDUuNmwtNjEsODMuNWMtMS42LDIuMi00LjgsMi4yLTYuNCwwLjFsLTYzLjMtODMuM2MtMi0yLjYtMC4xLTYuNCwzLjItNi40aDQwLjggYzIuNSwwLDQuNC0yLjMsMy45LTQuOGMtNS4xLTI0LjItMTcuOC00Ni41LTM2LjUtNjMuN2MtMjEuMi0xOS40LTQ4LjItMzAuMS03Ni0zMC4xYy0yNi41LDAtNTIuNiw5LjctNzMuNywyNy4zbC0zLjEsMi41IGMtMS42LDEuMy0zLjksMS4yLTUuNC0wLjNsLTE4LjUtMTguNWMtMS42LTEuNi0xLjUtNC4zLDAuMi01LjlsMy41LTMuMWMyNy0yMy4yLDYxLjQtMzUuOSw5Ni44LTM1LjljMzgsMCw3My45LDEzLjcsMTAxLjIsMzguNyBjMjMuMiwyMS4xLDQwLjMsNTUuMiw0NS43LDkwLjFjMC4zLDEuOSwxLjksMy40LDMuOSwzLjRoNDEuM0M0NTEuNCwyMzkuMiw0NTMuMywyNDMsNDUxLjQsMjQ1LjZ6Jy8lM0UlM0MvZyUzRSUzQy9zdmclM0VcIjtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmljb25SZXRha2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgdmVyc2lvbj0nMS4xJyBpZD0nTGF5ZXJfMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycgeD0nMHB4JyB5PScwcHgnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyBlbmFibGUtYmFja2dyb3VuZD0nbmV3IDAgMCA1MTIgNTEyJyB4bWw6c3BhY2U9J3ByZXNlcnZlJyUzRSUzQ2NpcmNsZSBmaWxsPSclMjM3MjdBODcnIGN4PScyNTYnIGN5PScyNTYnIHI9JzI1NicvJTNFJTNDZyBpZD0nSWNvbl81XyclM0UlM0NnJTNFJTNDcGF0aCBmaWxsPSclMjNGRkZGRkYnIGQ9J00zOTQuMiwxNDJMMzcwLDExNy44Yy0xLjYtMS42LTQuMS0xLjYtNS43LDBMMjU4LjgsMjIzLjRjLTEuNiwxLjYtNC4xLDEuNi01LjcsMEwxNDcuNiwxMTcuOCBjLTEuNi0xLjYtNC4xLTEuNi01LjcsMEwxMTcuOCwxNDJjLTEuNiwxLjYtMS42LDQuMSwwLDUuN2wxMDUuNSwxMDUuNWMxLjYsMS42LDEuNiw0LjEsMCw1LjdMMTE3LjgsMzY0LjRjLTEuNiwxLjYtMS42LDQuMSwwLDUuNyBsMjQuMSwyNC4xYzEuNiwxLjYsNC4xLDEuNiw1LjcsMGwxMDUuNS0xMDUuNWMxLjYtMS42LDQuMS0xLjYsNS43LDBsMTA1LjUsMTA1LjVjMS42LDEuNiw0LjEsMS42LDUuNywwbDI0LjEtMjQuMSBjMS42LTEuNiwxLjYtNC4xLDAtNS43TDI4OC42LDI1OC44Yy0xLjYtMS42LTEuNi00LjEsMC01LjdsMTA1LjUtMTA1LjVDMzk1LjcsMTQ2LjEsMzk1LjcsMTQzLjUsMzk0LjIsMTQyeicvJTNFJTNDL2clM0UlM0MvZyUzRSUzQy9zdmclM0VcIjtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLmljb25GbGFzaE9mZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiZGF0YTppbWFnZS9zdmcreG1sLCUzQ3N2ZyB2ZXJzaW9uPScxLjEnIGlkPSdMYXllcl8xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyB4PScwcHgnIHk9JzBweCcgdmlld0JveD0nMCAwIDUxMiA1MTInIHN0eWxlPSdlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7JyB4bWw6c3BhY2U9J3ByZXNlcnZlJyUzRSUzQ3N0eWxlIHR5cGU9J3RleHQvY3NzJyUzRSAuc3QwJTdCZmlsbDolMjNGRkZGRkY7JTdEJTBBJTNDL3N0eWxlJTNFJTNDZyUzRSUzQ3BhdGggY2xhc3M9J3N0MCcgZD0nTTQ5OCw0ODMuN0w0Mi4zLDI4TDE0LDU2LjRsMTQ5LjgsMTQ5LjhMOTEsMjkzLjhjLTIuNSwzLTAuMSw3LjIsMy45LDcuMmgxNDMuOWMxLjYsMCwyLjcsMS4zLDIuNCwyLjcgTDE5Ny42LDUwN2MtMSw0LjQsNS44LDYuOSw4LjksMy4ybDExOC42LTE0Mi44TDQ2OS42LDUxMkw0OTgsNDgzLjd6Jy8lM0UlM0NwYXRoIGNsYXNzPSdzdDAnIGQ9J000NDksMjE4LjJjMi41LTMsMC4xLTcuMi0zLjktNy4ySDMwMS4yYy0xLjYsMC0yLjctMS4zLTIuNC0yLjdMMzQyLjQsNWMxLTQuNC01LjgtNi45LTguOS0zLjJMMjE0LjksMTQ0LjYgbDE2MS4zLDE2MS4zTDQ0OSwyMTguMnonLyUzRSUzQy9nJTNFJTNDL3N2ZyUzRVwiO1xuICAgIH07XG4gICAgY2xhc3NfMS5wcm90b3R5cGUuaWNvbkZsYXNoT24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgdmVyc2lvbj0nMS4xJyBpZD0nTGF5ZXJfMScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycgeD0nMHB4JyB5PScwcHgnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyBzdHlsZT0nZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOycgeG1sOnNwYWNlPSdwcmVzZXJ2ZSclM0UlM0NzdHlsZSB0eXBlPSd0ZXh0L2NzcyclM0UgLnN0MCU3QmZpbGw6JTIzRkZGRkZGOyU3RCUwQSUzQy9zdHlsZSUzRSUzQ3BhdGggY2xhc3M9J3N0MCcgZD0nTTI4Ny4yLDIxMWMtMS42LDAtMi43LTEuMy0yLjQtMi43TDMyOC40LDVjMS00LjQtNS44LTYuOS04LjktMy4yTDc3LDI5My44Yy0yLjUsMy0wLjEsNy4yLDMuOSw3LjJoMTQzLjkgYzEuNiwwLDIuNywxLjMsMi40LDIuN0wxODMuNiw1MDdjLTEsNC40LDUuOCw2LjksOC45LDMuMmwyNDIuNS0yOTJjMi41LTMsMC4xLTcuMi0zLjktNy4yTDI4Ny4yLDIxMUwyODcuMiwyMTF6Jy8lM0UlM0Mvc3ZnJTNFXCI7XG4gICAgfTtcbiAgICBjbGFzc18xLnByb3RvdHlwZS5pY29uRmxhc2hBdXRvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHZlcnNpb249JzEuMScgaWQ9J0xheWVyXzEnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHg9JzBweCcgeT0nMHB4JyB2aWV3Qm94PScwIDAgNTEyIDUxMicgc3R5bGU9J2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsnIHhtbDpzcGFjZT0ncHJlc2VydmUnJTNFJTNDc3R5bGUgdHlwZT0ndGV4dC9jc3MnJTNFIC5zdDAlN0JmaWxsOiUyM0ZGRkZGRjslN0QlMEElM0Mvc3R5bGUlM0UlM0NwYXRoIGNsYXNzPSdzdDAnIGQ9J00yODcuMiwyMTFjLTEuNiwwLTIuNy0xLjMtMi40LTIuN0wzMjguNCw1YzEtNC40LTUuOC02LjktOC45LTMuMkw3NywyOTMuOGMtMi41LDMtMC4xLDcuMiwzLjksNy4yaDE0My45IGMxLjYsMCwyLjcsMS4zLDIuNCwyLjdMMTgzLjYsNTA3Yy0xLDQuNCw1LjgsNi45LDguOSwzLjJsMjQyLjUtMjkyYzIuNS0zLDAuMS03LjItMy45LTcuMkwyODcuMiwyMTFMMjg3LjIsMjExeicvJTNFJTNDZyUzRSUzQ3BhdGggY2xhc3M9J3N0MCcgZD0nTTMyMS4zLDE4Nmw3NC0xODZINDM4bDc0LDE4NmgtNDMuNWwtMTEuOS0zMi41aC04MC45bC0xMiwzMi41SDMyMS4zeiBNNDE1LjgsNDcuOWwtMjcuMiw3MC43aDU0LjlsLTI3LjItNzAuNyBINDE1Ljh6Jy8lM0UlM0MvZyUzRSUzQy9zdmclM0VcIjtcbiAgICB9O1xuICAgIGNsYXNzXzEucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHZpZGVvU3RyZWFtU3R5bGUgPSB0aGlzLmZhY2luZ01vZGUgPT0gXCJ1c2VyXCIgPyB7IHRyYW5zZm9ybTogJ3NjYWxlWCgtMSknIH0gOiB7fTtcbiAgICAgICAgcmV0dXJuIChoKFwiZGl2XCIsIHsgY2xhc3M6IFwiY2FtZXJhLXdyYXBwZXJcIiB9LCBoKFwiZGl2XCIsIHsgY2xhc3M6IFwiY2FtZXJhLWhlYWRlclwiIH0sIGgoXCJzZWN0aW9uXCIsIHsgY2xhc3M6IFwiaXRlbXNcIiB9LCBoKFwiZGl2XCIsIHsgY2xhc3M6IFwiaXRlbSBjbG9zZVwiLCBvbkNsaWNrOiBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMuaGFuZGxlQ2xvc2UoZSk7IH0gfSwgaChcImltZ1wiLCB7IHNyYzogdGhpcy5pY29uRXhpdCgpIH0pKSwgaChcImRpdlwiLCB7IGNsYXNzOiBcIml0ZW0gZmxhc2hcIiwgb25DbGljazogZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLmhhbmRsZUZsYXNoQ2xpY2soZSk7IH0gfSwgdGhpcy5mbGFzaE1vZGVzLmxlbmd0aCA+IDAgJiYgKGgoXCJkaXZcIiwgbnVsbCwgdGhpcy5mbGFzaE1vZGUgPT0gJ29mZicgPyBoKFwiaW1nXCIsIHsgc3JjOiB0aGlzLmljb25GbGFzaE9mZigpIH0pIDogJycsIHRoaXMuZmxhc2hNb2RlID09ICdhdXRvJyA/IGgoXCJpbWdcIiwgeyBzcmM6IHRoaXMuaWNvbkZsYXNoQXV0bygpIH0pIDogJycsIHRoaXMuZmxhc2hNb2RlID09ICdmbGFzaCcgPyBoKFwiaW1nXCIsIHsgc3JjOiB0aGlzLmljb25GbGFzaE9uKCkgfSkgOiAnJykpKSkpLCB0aGlzLnBob3RvICYmIChoKFwiZGl2XCIsIHsgY2xhc3M6IFwiYWNjZXB0XCIgfSwgaChcImRpdlwiLCB7IGNsYXNzOiBcImFjY2VwdC1pbWFnZVwiLCBzdHlsZTogeyBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKFwiICsgdGhpcy5waG90b1NyYyArIFwiKVwiIH0gfSkpKSwgaChcImRpdlwiLCB7IGNsYXNzOiBcImNhbWVyYS12aWRlb1wiLCBzdHlsZTogeyBkaXNwbGF5OiB0aGlzLnBob3RvID8gJ25vbmUnIDogJycgfSB9LCB0aGlzLnNob3dTaHV0dGVyT3ZlcmxheSAmJiAoaChcImRpdlwiLCB7IGNsYXNzOiBcInNodXR0ZXItb3ZlcmxheVwiIH0pKSwgdGhpcy5oYXNJbWFnZUNhcHR1cmUoKSA/IChoKFwidmlkZW9cIiwgeyBzdHlsZTogdmlkZW9TdHJlYW1TdHlsZSwgcmVmOiBmdW5jdGlvbiAoZWwpIHsgcmV0dXJuIF90aGlzLnZpZGVvRWxlbWVudCA9IGVsOyB9LCBhdXRvcGxheTogdHJ1ZSwgcGxheXNpbmxpbmU6IHRydWUgfSkpIDogKGgoXCJjYW52YXNcIiwgeyByZWY6IGZ1bmN0aW9uIChlbCkgeyByZXR1cm4gX3RoaXMuY2FudmFzRWxlbWVudCA9IGVsOyB9LCB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIgfSkpLCBoKFwiY2FudmFzXCIsIHsgY2xhc3M6IFwib2Zmc2NyZWVuLWltYWdlLXJlbmRlclwiLCByZWY6IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5vZmZzY3JlZW5DYW52YXMgPSBlOyB9LCB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIgfSkpLCBoKFwiZGl2XCIsIHsgY2xhc3M6IFwiY2FtZXJhLWZvb3RlclwiIH0sICF0aGlzLnBob3RvID8gKFtcbiAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJzaHV0dGVyXCIsIG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5oYW5kbGVTaHV0dGVyQ2xpY2soZSk7IH0gfSwgaChcImRpdlwiLCB7IGNsYXNzOiBcInNodXR0ZXItYnV0dG9uXCIgfSkpLFxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInJvdGF0ZVwiLCBvbkNsaWNrOiBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMuaGFuZGxlUm90YXRlQ2xpY2soZSk7IH0gfSwgaChcImltZ1wiLCB7IHNyYzogdGhpcy5pY29uUmV2ZXJzZUNhbWVyYSgpIH0pKSxcbiAgICAgICAgICAgIHsgLyp0aGlzLmhhc011bHRpcGxlQ2FtZXJhcyAmJiAoPGRpdiBjbGFzcz1cIml0ZW0gcm90YXRlXCIgb25DbGljaz17KGUpID0+IHRoaXMuaGFuZGxlUm90YXRlQ2xpY2soZSl9PjwvZGl2PikqL31cbiAgICAgICAgXSkgOiAoaChcInNlY3Rpb25cIiwgeyBjbGFzczogXCJpdGVtc1wiIH0sIGgoXCJkaXZcIiwgeyBjbGFzczogXCJpdGVtIGFjY2VwdC1jYW5jZWxcIiwgb25DbGljazogZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLmhhbmRsZUNhbmNlbFBob3RvKGUpOyB9IH0sIGgoXCJpbWdcIiwgeyBzcmM6IHRoaXMuaWNvblJldGFrZSgpIH0pKSwgaChcImRpdlwiLCB7IGNsYXNzOiBcIml0ZW0gYWNjZXB0LXVzZVwiLCBvbkNsaWNrOiBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMuaGFuZGxlQWNjZXB0UGhvdG8oZSk7IH0gfSwgaChcImltZ1wiLCB7IHNyYzogdGhpcy5pY29uQ29uZmlybSgpIH0pKSkpKSkpO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXNzXzEsIFwiYXNzZXRzRGlyc1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gW1wiaWNvbnNcIl07IH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGFzc18xLnByb3RvdHlwZSwgXCJlbFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZ2V0RWxlbWVudCh0aGlzKTsgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXNzXzEsIFwic3R5bGVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFwiOmhvc3R7LS1oZWFkZXItaGVpZ2h0OjRlbTstLWZvb3Rlci1oZWlnaHQ6OWVtOy0tc2h1dHRlci1zaXplOjZlbTstLWljb24tc2l6ZS1oZWFkZXI6MS41ZW07LS1pY29uLXNpemUtZm9vdGVyOjIuNWVtOy0tbWFyZ2luLXNpemUtaGVhZGVyOjEuNWVtOy0tbWFyZ2luLXNpemUtZm9vdGVyOjIuMGVtO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LOKAnFNlZ29lIFVJ4oCdLOKAnFJvYm90b+KAnSzigJxEcm9pZCBTYW5z4oCdLOKAnEhlbHZldGljYSBOZXVl4oCdLHNhbnMtc2VyaWY7ZGlzcGxheTpibG9ja30uaXRlbXMsOmhvc3R7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0uaXRlbXN7LXdlYmtpdC1ib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym94LXNpemluZzpib3JkZXItYm94O2Rpc3BsYXk6LW1zLWZsZXhib3g7ZGlzcGxheTpmbGV4Oy1tcy1mbGV4LWFsaWduOmNlbnRlcjthbGlnbi1pdGVtczpjZW50ZXI7LW1zLWZsZXgtcGFjazpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcn0uaXRlbXMgLml0ZW17LW1zLWZsZXg6MTtmbGV4OjE7dGV4dC1hbGlnbjpjZW50ZXJ9Lml0ZW1zIC5pdGVtOmZpcnN0LWNoaWxke3RleHQtYWxpZ246bGVmdH0uaXRlbXMgLml0ZW06bGFzdC1jaGlsZHt0ZXh0LWFsaWduOnJpZ2h0fS5jYW1lcmEtd3JhcHBlcntwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5Oi1tcy1mbGV4Ym94O2Rpc3BsYXk6ZmxleDstbXMtZmxleC1kaXJlY3Rpb246Y29sdW1uO2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfS5jYW1lcmEtaGVhZGVye2NvbG9yOiNmZmY7YmFja2dyb3VuZC1jb2xvcjojMDAwO2hlaWdodDp2YXIoLS1oZWFkZXItaGVpZ2h0KX0uY2FtZXJhLWhlYWRlciAuaXRlbXN7cGFkZGluZzp2YXIoLS1tYXJnaW4tc2l6ZS1oZWFkZXIpfS5jYW1lcmEtZm9vdGVye3Bvc2l0aW9uOnJlbGF0aXZlO2NvbG9yOiNmZmY7YmFja2dyb3VuZC1jb2xvcjojMDAwO2hlaWdodDp2YXIoLS1mb290ZXItaGVpZ2h0KX0uY2FtZXJhLWZvb3RlciAuaXRlbXN7cGFkZGluZzp2YXIoLS1tYXJnaW4tc2l6ZS1mb290ZXIpfS5jYW1lcmEtdmlkZW97cG9zaXRpb246cmVsYXRpdmU7LW1zLWZsZXg6MTtmbGV4OjE7b3ZlcmZsb3c6aGlkZGVufS5jYW1lcmEtdmlkZW8sdmlkZW97YmFja2dyb3VuZC1jb2xvcjojMDAwfXZpZGVve3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7bWF4LWhlaWdodDoxMDAlO21pbi1oZWlnaHQ6MTAwJTstby1vYmplY3QtZml0OmNvdmVyO29iamVjdC1maXQ6Y292ZXJ9LnNodXR0ZXJ7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7dG9wOjUwJTt3aWR0aDp2YXIoLS1zaHV0dGVyLXNpemUpO2hlaWdodDp2YXIoLS1zaHV0dGVyLXNpemUpO21hcmdpbi10b3A6Y2FsYyh2YXIoLS1zaHV0dGVyLXNpemUpIC8gLTIpO21hcmdpbi1sZWZ0OmNhbGModmFyKC0tc2h1dHRlci1zaXplKSAvIC0yKTtib3JkZXItcmFkaXVzOjEwMCU7YmFja2dyb3VuZC1jb2xvcjojYzZjZGQ4O3BhZGRpbmc6MTJweDstd2Via2l0LWJveC1zaXppbmc6Ym9yZGVyLWJveDtib3gtc2l6aW5nOmJvcmRlci1ib3h9LnNodXR0ZXI6YWN0aXZlIC5zaHV0dGVyLWJ1dHRvbntiYWNrZ3JvdW5kLWNvbG9yOiM5ZGE5YmJ9LnNodXR0ZXItYnV0dG9ue2JhY2tncm91bmQtY29sb3I6I2ZmZjtib3JkZXItcmFkaXVzOjEwMCU7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0ucm90YXRle2Rpc3BsYXk6LW1zLWZsZXhib3g7ZGlzcGxheTpmbGV4Oy1tcy1mbGV4LWFsaWduOmNlbnRlcjthbGlnbi1pdGVtczpjZW50ZXI7cG9zaXRpb246YWJzb2x1dGU7cmlnaHQ6dmFyKC0tbWFyZ2luLXNpemUtZm9vdGVyKTt0b3A6MDtoZWlnaHQ6MTAwJTtjb2xvcjojZmZmfS5yb3RhdGUsLnJvdGF0ZSBpbWd7d2lkdGg6dmFyKC0taWNvbi1zaXplLWZvb3Rlcil9LnJvdGF0ZSBpbWd7aGVpZ2h0OnZhcigtLWljb24tc2l6ZS1mb290ZXIpfS5zaHV0dGVyLW92ZXJsYXl7ei1pbmRleDo1O3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZC1jb2xvcjojMDAwfS5lcnJvcnt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2NvbG9yOiNmZmY7ZGlzcGxheTotbXMtZmxleGJveDtkaXNwbGF5OmZsZXg7LW1zLWZsZXgtcGFjazpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjstbXMtZmxleC1hbGlnbjpjZW50ZXI7YWxpZ24taXRlbXM6Y2VudGVyfS5hY2NlcHR7YmFja2dyb3VuZC1jb2xvcjojMDAwOy1tcy1mbGV4OjE7ZmxleDoxfS5hY2NlcHQgLmFjY2VwdC1pbWFnZXt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JhY2tncm91bmQtcG9zaXRpb246NTAlO2JhY2tncm91bmQtc2l6ZTpjb3ZlcjtiYWNrZ3JvdW5kLXJlcGVhdDpuby1yZXBlYXR9LmNsb3NlIGltZywuZmxhc2ggaW1ne3dpZHRoOnZhcigtLWljb24tc2l6ZS1oZWFkZXIpO2hlaWdodDp2YXIoLS1pY29uLXNpemUtaGVhZGVyKX0uYWNjZXB0LWNhbmNlbCBpbWcsLmFjY2VwdC11c2UgaW1ne3dpZHRoOnZhcigtLWljb24tc2l6ZS1mb290ZXIpO2hlaWdodDp2YXIoLS1pY29uLXNpemUtZm9vdGVyKX0ub2Zmc2NyZWVuLWltYWdlLXJlbmRlcnt0b3A6MDtsZWZ0OjA7dmlzaWJpbGl0eTpoaWRkZW47cG9pbnRlci1ldmVudHM6bm9uZTt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfVwiOyB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gY2xhc3NfMTtcbn0oKSk7XG5leHBvcnQgeyBDYW1lcmFQV0EgYXMgcHdhX2NhbWVyYSB9O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==