/**
 * 抹平wx小程序和支付宝小程序 SelectorQuery API的差异
 * 
 * ===========================
 * 微信小程序使用SelectorQuery API有两种写法  
 * 1.my.createSelectorQuery(callback).exec()
 * 2.my.createSelectorQuery().exec(callback)
 * 
 * 支付宝小程序不兼容第一种写法， 导致callback不执行，这里对此情况进行了兼容
 * ===========================
*/
function alipaySelectorQuery() {
  // 重写选择节点的函数， 选择节点时新建一个用户缓存callback的数组
  const query = my.createSelectorQuery()
  const overrideQueryFns = ['in', 'select', 'selectAll', 'selectViewport']
  overrideQueryFns.forEach(function (name) {
    const _cacheFn = query.__proto__[name]
    query.__proto__[name] = function (selector) {
      const node = _cacheFn.call(this, selector)
      if (!node.__query) {
        node.__query = this
        // 新建一个用于缓存callback的数组
        this.cacheCallbacks = []
      }
      return node
    }
  })

  // 重新获取节点信息函数，将回调函数放入缓存数组
  const node = query.selectViewport()
  const overrideNodeFns = ['boundingClientRect', 'scrollOffset']
  overrideNodeFns.forEach(function (name) {
    const _cacheFn = node.__proto__[name]

    node.__proto__[name] = function (cb) {
      // 将callback缓存
      this.__query && this.__query.cacheCallbacks.push(cb)
      return _cacheFn.call(this, cb)
    }
  })

  // 重写exec 缓存执行的callback
  const _exec = query.__proto__.exec
  query.__proto__.exec = function (cb) {
    const _this = this

    return _exec.call(this, function (rects) {
      cb && cb.call(this, rects)
      if (_this.cacheCallbacks && _this.cacheCallbacks.length) {
        _this.cacheCallbacks.forEach(function (cacheCallback, i) {
          cacheCallback && cacheCallback(rects[i])
        })
      }
      _this.cacheCallbacks = null
    })
  }
}

module.exports = alipaySelectorQuery