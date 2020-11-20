"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var assign = require('lodash.assign');

var keys = require('lodash.keys');

var Queue = require('../utils/Queue');

var buildArgs = require('../utils/buildArgs');

var queue = new Queue();

var promisify = function promisify(fn, caller, type) {
  if (type === void 0) type = 'weapp-style';
  return function () {
    var args = buildArgs.apply(null, arguments);
    return new Promise(function (resolve, reject) {
      switch (type) {
        case 'weapp-style':
          fn.call(caller, assign({}, args[0], {
            success: function success(res) {
              resolve(res);
            },
            fail: function fail(err) {
              reject(err);
            }
          }));
          break;

        case 'weapp-fix':
          fn.apply(caller, args.concat(resolve).concat(reject));
          break;

        case 'error-first':
          fn.apply(caller, args.concat([function (err, res) {
            return err ? reject(err) : resolve(res);
          }]));
          break;

        default:
          break;
      }
    });
  };
};

var noPromiseMethods = ['stopRecord', 'getRecorderManager', 'pauseVoice', 'stopVoice', 'pauseBackgroundAudio', 'stopBackgroundAudio', 'getBackgroundAudioManager', 'createAudioContext', 'createInnerAudioContext', 'createVideoContext', 'createCameraContext', 'createMapContext', 'canIUse', 'startAccelerometer', 'stopAccelerometer', 'startCompass', 'stopCompass', 'onBLECharacteristicValueChange', 'onBLEConnectionStateChange', 'hideToast', 'hideLoading', 'showNavigationBarLoading', 'hideNavigationBarLoading', 'navigateBack', 'createAnimation', 'pageScrollTo', 'createSelectorQuery', 'createCanvasContext', 'createContext', 'drawCanvas', 'hideKeyboard', 'stopPullDownRefresh', 'arrayBufferToBase64', 'base64ToArrayBuffer'];
var simplifyArgs = {
  request: 'url',
  downloadFile: 'url',
  connectSocket: 'url',
  sendSocketMessage: 'data',
  previewImage: 'urls',
  getImageInfo: 'src',
  saveImageToPhotosAlbum: 'filePath',
  playVoice: 'filePath',
  playBackgroundAudio: 'dataUrl',
  seekBackgroundAudio: 'position',
  saveVideoToPhotosAlbum: 'filePath',
  saveFile: 'tempFilePath',
  getFileInfo: 'filePath',
  getSavedFileInfo: 'filePath',
  removeSavedFile: 'filePath',
  openDocument: 'filePath',
  setStorage: 'key,data',
  getStorage: 'key',
  removeStorage: 'key',
  openLocation: 'latitude,longitude',
  makePhoneCall: 'phoneNumber',
  setClipboardData: 'data',
  getConnectedBluetoothDevices: 'services',
  createBLEConnection: 'deviceId',
  closeBLEConnection: 'deviceId',
  getBLEDeviceServices: 'deviceId',
  startBeaconDiscovery: 'uuids',
  setScreenBrightness: 'value',
  setKeepScreenOn: 'keepScreenOn',
  showToast: 'title',
  showLoading: 'title,mask',
  showModal: 'title,content',
  showActionSheet: 'itemList,itemColor',
  setNavigationBarTitle: 'title',
  setNavigationBarColor: 'frontColor,backgroundColor',
  setTabBarBadge: 'index,text',
  removeTabBarBadge: 'idnex',
  showTabBarRedDot: 'index',
  hideTabBarRedDot: 'index',
  showTabBar: 'animation',
  hideTabBar: 'animation',
  setTopBarText: 'text',
  navigateTo: 'url',
  redirectTo: 'url',
  navigateBack: 'delta',
  reLaunch: 'url',
  pageScrollTo: 'scrollTop,duration'
};

var makeObj = function makeObj(arr) {
  var obj = {};
  arr.forEach(function (v) {
    obj[v] = 1;
  });
  return obj;
};

module.exports = function install() {
  var ewa = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var removeFromPromisify = arguments.length > 1 ? arguments[1] : undefined;

  var _api;

  var api;

  if ((typeof wx === "undefined" ? "undefined" : _typeof(wx)) === 'object') {
    api = wx;
    _api = ewa.wx = ewa.wx || assign({}, wx);
  }

  if ((typeof swan === "undefined" ? "undefined" : _typeof(swan)) === 'object') {
    api = swan;
    _api = ewa.swan = ewa.swan || assign({}, swan);
  }

  if ((typeof tt === "undefined" ? "undefined" : _typeof(tt)) === 'object') {
    api = tt;
    _api = ewa.tt = ewa.tt || assign({}, tt);
  }

  if ((typeof my === "undefined" ? "undefined" : _typeof(my)) === 'object') {
    api = my;
    _api = ewa.my = ewa.my || assign({}, my);
  }

  var noPromiseMap = {};

  if (removeFromPromisify) {
    if (Array.isArray(removeFromPromisify)) {
      noPromiseMap = makeObj(noPromiseMethods.concat(removeFromPromisify));
    } else {
      noPromiseMap = assign({}, makeObj(noPromiseMethods), removeFromPromisify);
    }
  }

  keys(_api).forEach(function (key) {
    if (!noPromiseMap[key] && key.substr(0, 2) !== 'on' && key.substr(-4) !== 'Sync') {
      _api[key] = promisify(function () {
        var args = buildArgs.apply(null, arguments);
        var fixArgs = args[0];
        var failFn = args.pop();
        var successFn = args.pop();

        if (simplifyArgs[key] && Object.prototype.toString.call(fixArgs) !== '[object Object]') {
          fixArgs = {};
          var ps = simplifyArgs[key];

          if (args.length) {
            ps.split(',').forEach(function (p, i) {
              if (args[i]) {
                fixArgs[p] = args[i];
              }
            });
          }
        }

        fixArgs.success = successFn;
        fixArgs.fail = failFn;
        return api[key].call(api, fixArgs);
      }, _api, 'weapp-fix');

      if (key === 'request') {
        var rq = _api[key];

        _api[key] = function request() {
          var args = buildArgs.apply(null, arguments);
          return new Promise(function (resolve, reject) {
            queue.push(function () {
              return rq.apply(_api, args).then(resolve, reject);
            });
          });
        };
      }
    }
  });
  ewa.promisify = promisify;
  ewa.api = _api;
};