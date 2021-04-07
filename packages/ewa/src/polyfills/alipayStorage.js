// 抹平wx小程序和支付宝小程序 storageSync API的差异
function alipayStorage() {
  /**
   * =======   setStorageSync、removeStorageSync   =======
   * 微信中   wx.setStorageSync('key', 'data')
   * 支付宝   my.setStorageSync({ key, data })
   * */
  ['setStorageSync', 'removeStorageSync'].forEach(methodName => {
    const _cacheFn = my[methodName]
    my[methodName] = function (key, data) {
      if (typeof key === 'object') return _cacheFn(key);
      return _cacheFn({ key, data });
    }
  })


  /**
   * =======   getStorageSync   =======
   * 调用：
   * 微信中   wx.getStorageSync('key')
   * 支付宝   wx.getStorageSync({ key })
   * 
   * 返回：
   * 微信中直接返回 data
   * 支付宝返回 {success: true, data}
   * */
  const _getStorageSync = my.getStorageSync
  my.getStorageSync = function (key) {
    let res = null
    if (typeof key === 'object') {
      res = _getStorageSync(key)
    } else {
      res = _getStorageSync({ key })
    }
    if (res.success) return res.data
  }

}

module.exports = alipayStorage