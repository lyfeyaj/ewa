const assign = require('lodash.assign');
const keys = require('lodash.keys');
const Queue = require('../utils/Queue');
const buildArgs = require('../utils/buildArgs');

const queue = new Queue();

/**
 * Promisify a callback function
 * @param  {Function} fn     callback function
 * @param  {Object}   caller caller
 * @param  {String}   type   weapp-style|error-first, default to weapp-style
 * @return {Function}        promisified function
 */
const promisify = function (fn, caller, type) {
  if (type === void 0) type = 'weapp-style';

  return function () {
    let args = buildArgs.apply(null, arguments);

    return new Promise(((resolve, reject) => {
      switch (type) {
        case 'weapp-style':
          fn.call(caller, assign({}, args[0],
            {
              success: function success(res) {
                resolve(res);
              },
              fail: function fail(err) {
                reject(err);
              },
            }));
          break;
        case 'weapp-fix':
          fn.apply(caller, args.concat(resolve).concat(reject));
          break;
        case 'error-first':
          fn.apply(
            caller,
            args.concat([
              function (err, res) {
                return err ? reject(err) : resolve(res);
              },
            ])
          );
          break;
        default:
          break;
      }
    }));
  };
};

// The methods no need to promisify
const noPromiseMethods = [
  // 媒体
  'stopRecord',
  'getRecorderManager',
  'pauseVoice',
  'stopVoice',
  'pauseBackgroundAudio',
  'stopBackgroundAudio',
  'getBackgroundAudioManager',
  'createAudioContext',
  'createInnerAudioContext',
  'createVideoContext',
  'createCameraContext',

  // 位置
  'createMapContext',

  // 设备
  'canIUse',
  'startAccelerometer',
  'stopAccelerometer',
  'startCompass',
  'stopCompass',
  'onBLECharacteristicValueChange',
  'onBLEConnectionStateChange',

  // 界面
  'hideToast',
  'hideLoading',
  'showNavigationBarLoading',
  'hideNavigationBarLoading',
  'navigateBack',
  'createAnimation',
  'pageScrollTo',
  'createSelectorQuery',
  'createCanvasContext',
  'createContext',
  'drawCanvas',
  'hideKeyboard',
  'stopPullDownRefresh',

  // 拓展接口
  'arrayBufferToBase64',
  'base64ToArrayBuffer',
];

const simplifyArgs = {
  // network
  request: 'url',
  downloadFile: 'url',
  connectSocket: 'url',
  sendSocketMessage: 'data',

  // media
  previewImage: 'urls',
  getImageInfo: 'src',
  saveImageToPhotosAlbum: 'filePath',
  playVoice: 'filePath',
  playBackgroundAudio: 'dataUrl',
  seekBackgroundAudio: 'position',
  saveVideoToPhotosAlbum: 'filePath',

  // files
  saveFile: 'tempFilePath',
  getFileInfo: 'filePath',
  getSavedFileInfo: 'filePath',
  removeSavedFile: 'filePath',
  openDocument: 'filePath',

  // device
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

  // screen
  showToast: 'title',
  showLoading: 'title,mask',
  showModal: 'title,content',
  showActionSheet: 'itemList,itemColor',
  setNavigationBarTitle: 'title',
  setNavigationBarColor: 'frontColor,backgroundColor',

  // tabBar
  setTabBarBadge: 'index,text',
  removeTabBarBadge: 'idnex',
  showTabBarRedDot: 'index',
  hideTabBarRedDot: 'index',
  showTabBar: 'animation',
  hideTabBar: 'animation',

  // topBar
  setTopBarText: 'text',

  // navigator
  navigateTo: 'url',
  redirectTo: 'url',
  navigateBack: 'delta',
  reLaunch: 'url',

  // pageScroll
  pageScrollTo: 'scrollTop,duration',
};

const makeObj = function (arr) {
  let obj = {};
  arr.forEach((v) => {
    obj[v] = 1;
  });
  return obj;
};

/*
 * wx basic api promisify
 * useage:
 * ewa.login().then().catch()
 */
module.exports = function install(ewa = {}, removeFromPromisify) {
  let _api;
  let api;

  // 微信小程序支持
  if (typeof wx === 'object') {
    api = wx;
    _api = (ewa.wx = ewa.wx || assign({}, wx));
  }

  // 百度小程序支持
  if (typeof swan === 'object') {
    api = swan;
    _api = (ewa.swan = ewa.swan || assign({}, swan));
  }

  // 头条小程序支持
  if (typeof tt === 'object') {
    api = tt;
    _api = (ewa.tt = ewa.tt || assign({}, tt));
  }

  // 支付宝小程序支持
  if (typeof my === 'object') {
    api = my;
    _api = (ewa.my = ewa.my || assign({}, my));
  }

  // qq小程序支持
  if (typeof qq === 'object') {
    api = qq;
    _api = (ewa.qq = ewa.qq || assign({}, qq));
  }

  let noPromiseMap = {};
  if (removeFromPromisify) {
    if (Array.isArray(removeFromPromisify)) {
      noPromiseMap = makeObj(noPromiseMethods.concat(removeFromPromisify));
    } else {
      noPromiseMap = assign({}, makeObj(noPromiseMethods), removeFromPromisify);
    }
  }

  keys(_api).forEach((key) => {
    if (!noPromiseMap[key] && key.substr(0, 2) !== 'on' && key.substr(-4) !== 'Sync') {
      _api[key] = promisify(function () {
        let args = buildArgs.apply(null, arguments);

        let fixArgs = args[0];
        let failFn = args.pop();
        let successFn = args.pop();
        if (simplifyArgs[key] && Object.prototype.toString.call(fixArgs) !== '[object Object]') {
          fixArgs = {};
          let ps = simplifyArgs[key];
          if (args.length) {
            ps.split(',').forEach((p, i) => {
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

      // enhanced request with queue
      if (key === 'request') {
        let rq = _api[key];

        // overwrite request method
        _api[key] = function request() {
          let args = buildArgs.apply(null, arguments);
          return new Promise(((resolve, reject) => {
            queue.push(() => rq.apply(_api, args).then(resolve, reject));
          }));
        };
      }
    }
  });

  ewa.promisify = promisify;

  // 通用接口支持
  // TODO: 添加接口差异提示
  ewa.api = _api;
};
