## Javascript
``注意:`` 由于小程序之间的API不是完全对等, 打包会强制在支付宝小程序根目录生成一个[shim.js](https://github.com/douzi8/wxToAlipay/blob/master/lib/js/shim.js)模块用于处理小程序API, 该文件可以自定义放在微信小程序源码里面

## 如何定制shim.js
1. 复制[shim.custom.js](https://github.com/douzi8/wxToAlipay/blob/master/lib/js/shim.custom.js)到[shim.js](https://github.com/douzi8/wxToAlipay/blob/master/lib/js/shim.js)中

## Js转化规则
1. 字符串``wxMin``统一替换为``alipay``, 部分不能替换的情况，可以采取在源码这样写代码打标记
```JavaScript
let options = {
  url: 'https://m.lechebang.com/',
}

if ('alipay' === 'wxMin') {
  options.data = JSON.stringify(data)
} else {
  options.data = data
}

wx.request(options)
```
  转为支付宝小程序语法
```JavaScript
if ('alipay' === 'alipay') {
  options.data = JSON.stringify(data)
} else {
  options.data = data
}

my.httpRequest(options)
```
2. ``wx.``统一转化成``my.``
```JavaScript
wx.api
```
  转为支付宝小程序语法
```JavaScript
my.api
```
3. wx\[name\](options)
动态调用wx api
```
// 源码
wx[name](options)

// 打包后
_myShim.invoke(name, options)
```

4. wx.request(options)
静态调用wx api
```
// 源码
wx.request(options)

// 打包后
_myShim.invoke('request', options)
```

5. require
```JavaScript
let local = require('local')
```
  转为支付宝小程序语法
```JavaScript
let local = require('./local')
```

6. 支付宝不支持的es特性如下, 参考[es.polyfill.js](https://github.com/douzi8/wxToAlipay/blob/master/lib/js/es.polyfill.js)
```JavaScript
Reflect
Array.prototype.find
String.prototype.startsWith
String.prototype.endsWith
String.prototype.includes
```