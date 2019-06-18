function noop () {}

function paramsMap(options, maps = {}) {
  let params = {}

  for (let key in options) {
    let myKey = maps.hasOwnProperty(key) ? maps[key] : key
    params[myKey] = options[key]
  }

  return params
}

function setStorageSync (key, data) {
  return {
    key,
    data
  }
}

function removeStorageSync (key) {
  return {
    key
  }
}

function getStorageSync (key) {
  return my.getStorageSync({
    key
  }).data
}

function previewImage(options) {
  let params = paramsMap(options)
  let current = params.current

  if (current) {
    current = options.urls.indexOf(current)
  }

  if (current === -1 || !current) {
    current = 0
  }

  params.current = current

  return params
}

function makePhoneCall(options) {
  return paramsMap(options, {
    phoneNumber: 'number'
  })
}

function request(options) {
  let params = paramsMap(options, {
    header: 'headers',
  })
  let success = params.success || noop

  params.success = function (res) {
    let result = paramsMap(res, {
      headers: 'header',
      status: 'statusCode'
    })

    success(result)
  }

  return params
}

/**
 * wx success里面的system字段为'Android 6.0.1'
 */
function getSystemInfo(options) {
  let params = paramsMap(options)
  let success = params.success || noop

  params.success = function (res) {
    success(getSystemInfoSync(res))
  }

  return params
}

function getSystemInfoSync(res) {
  res.system = res.platform + " " + res.system;

  // 支付宝小程序windowHeight可能拿到0
  if (!res.windowHeight) {
    res.windowHeight = parseInt(res.screenHeight * res.windowWidth / res.screenWidth, 10) - 40;
  }

  return res;
}

/**
 * wx模态弹窗不同的参数对应到支付宝confirm和alert API
 */
function showModal(options) {
  let params = paramsMap(options)
  let showCancel = params.showCancel

  if (typeof showCancel === 'undefined') {
    showCancel = true
  }

  // 确认框
  if (showCancel) {
    params.confirmButtonText = params.confirmText
    params.cancelButtonText = params.cancelText
  } else {
    // 提醒框
    params.buttonText = params.confirmText
  }

  my[showCancel ? 'confirm' : 'alert'](params)
}

/**
 * 参数{icon: 'loading'} 无法成功映射，建议不要使用
 */
function showToast (options) {
  let params = paramsMap(options, {
    title: 'content',
    icon: 'type'
  })

  return params
}

/**
 * sucess回调没有取消操作
 * 点击取消或蒙层时，回调fail, errMsg 为 "showActionSheet:fail cancel"
 */
function showActionSheet (options) {
  let params = paramsMap(options, {
    itemList: 'items'
  })

  let success = params.success || noop
  let fail = params.fail || noop

  params.success = function ({
    index: tapIndex
  }) {
    if (tapIndex === -1) {
      fail({
        errMsg: 'showActionSheet:fail cancel'
      })
    } else {
      success({
        tapIndex
      })
    }
  }

  return params
}

// 此函数可以根据业务自行定制, 参数无法统一映射
function login (options) {
  let params = paramsMap(options);
  let success = params.success || noop;

  params.scopes = 'auth_user'

  params.success = function (res) {
    success({
      code: res.authCode
    });
  };

  return params;
}

// 此函数可以根据业务自行定制, 参数无法统一映射
function requestPayment(options) {
  let params = paramsMap(options, {
    alipay_trade_body: 'orderStr'
  });

  let success = params.success || noop;
  let fail = params.fail || noop;

  params.success = function (res) {
    if (res.resultCode === 9000) {
      success()
    } else {
      fail()
    }
  }

  return params
}

function showLoading (options) {
  let params = paramsMap(options, {
    title: 'content'
  });

  return params
}

const MAP = {
  login: 'getAuthCode',
  request: 'httpRequest',
  setNavigationBarTitle: 'setNavigationBar',
  setNavigationBarColor: 'setNavigationBar',
  requestPayment: 'tradePay'
}

// 处理
function invoke (name, params) {
  switch (name) {
    case 'login':
      params = login(params)
      break
    case 'showActionSheet':
      params = showActionSheet(params)
      break
    case 'showToast':
      params = showToast(params)
      break
    case 'showLoading':
      params = showLoading(params)
      break
    case 'request':
      params = request(params)
      break
    case 'makePhoneCall':
      params = makePhoneCall(params)
      break
    case 'previewImage':
      params = previewImage(params)
      break
    case 'setStorageSync':
      params = setStorageSync(params, arguments[2]);
      break
    case 'removeStorageSync':
      params = removeStorageSync(params)
      break
    case 'getSystemInfo':
      params = getSystemInfo(params)
      break
    case 'requestPayment':
      params = requestPayment(params)
      break
    case 'showModal':
      return showModal(params)
    case 'getStorageSync':
      return getStorageSync(params)
    case 'getSystemInfoSync':
      return getSystemInfoSync(my.getSystemInfoSync())
  }

  let result = MAP[name]
  let apiName = result ? result : name

  //console.log(`调用my.${apiName}, 参数${JSON.stringify(params)}`)

  return my[apiName](params)
}

module.exports = invoke