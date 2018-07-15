EWA (微信小程序增强开发工具)
=========================

Enhanced Wechat App Development Toolkit (微信小程序增强开发工具)

## 为什么开发这个工具？

厌倦了不停的对比 [wepy](https://github.com/Tencent/wepy) 或者 [mpvue](https://github.com/Meituan-Dianping/mpvue) 的特性，间歇性的踩雷，以及 `code once, run everywhere` 的幻想。只想给小程序开发插上效率的翅膀 ~

## 功能特性

1. async/await 支持
2. Javascript ES2017 语法
3. 原生小程序所有功能
4. 微信接口 Promise 化
5. 支持安装 NPM 包
6. 支持 SCSS 以及 小于 16k 的 background-image
7. 支持 source map, 方便调试
8. 添加新页面或新组件无需重启编译
9. 允许自定义编译流程

更多特性正在赶来 ... 敬请期待 👇

+ LESS 支持
+ 可跨项目复用的小程序组件或页面（通过NPM包管理）
+ Redux 支持

## 安装

需要 node 版本 >= 8

```bash
npm i -g ewa-cli 或者 yarn global add ewa-cli
```

## 如何使用

### 创建新项目

```bash
ewa new your_project_name
```

### 集成到现有小程序项目，仅支持小程序原生开发项目转换

***注意：使用此方法，请务必对项目代码做好备份！！！***

```bash
cd your_project_dir && ewa init
```

### 启动

运行 `npm start` 即可启动实时编译

运行 `npm run build` 即可编译线上版本（相比实时编译而言，去除了 source map 并增加了代码压缩混淆等，体积更小）

## 微信接口 Promise 化

```javascript
const { wx } = require('ewa');

Page({
  async onLoad() {
    let { data } = await wx.request({ url: 'http://your_api_endpoint' });
  }
})
```

## 配置

ewa 通过 `ewa.config.js` 来支持个性化配置。如下所示：

``` javascript
// ewa.config.js

module.exports = {
  // 公用代码库 (node_modules 打包生成的文件)名称，默认为 vendors.js
  commonModuleName: 'vendors.js',

  // 通用模块匹配模式，默认为 /[\\/]node_modules[\\/]/
  commonModulePattern: /[\\/]node_modules[\\/]/,

  // 是否简化路径，作用于 page 和 component，如 index/index.wxml=> index.wxml，默认为 false
  simplifyPath: false,

  // 文件夹快捷引用
  aliasDirs: [
    'apis',
    'assets',
    'constants',
    'utils'
  ],

  // 需要拷贝的文件类型
  copyFileTypes: [
    'png',
    'jpeg',
    'jpg',
    'gif',
    'svg',
    'ico'
  ],

  // webpack loader 规则
  rules: [],

  // webpack 插件
  plugins: [],

  // 嫌不够灵活？直接修改 webpack 配置
  webpack: function(config) {
    return config;
  }
};
```
