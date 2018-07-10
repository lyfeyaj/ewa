EWA
===

Enhanced Wechat App Development Toolkit (微信小程序增强开发工具)

## 功能特性

1. async/await 支持
2. Javascript ES2017 语法
3. 原生小程序所有功能
4. 微信接口 Promise 化
5. 支持安装 NPM 包
6. 支持 SCSS 以及 小于 16k 的 background-image
7. 添加新页面或新组件无需重启编译
8. 自定义编译流程

更多特性正在赶来 ... 敬请期待

## 安装

```bash
npm i -g ewa-cli 或者 yarn global add ewa-cli
```

## 如何使用

#### 创建新项目

```bash
ewa new your_project_name
```

#### 集成到现有小程序项目，仅支持小程序原生开发目录

```bash
cd your_project_dir && ewa init
```

#### 启动

运行 `npm start` 即可启动实时编译

运行 `npm run build` 即可编译线上版本（相比实时编译而言，体积更小）

## 配置

ewa 通过 `ewa.config.js` 来支持个性化配置。如下所示：

``` javascript
// ewa.config.js

module.exports = {
  // 公用代码库 (node_modules 打包生成的文件)名称，默认为 vendors.js
  commonModuleName: 'vendors.js',

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
  plugins: []
};
```
