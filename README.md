EWA
===

Enhanced Wechat App Development Toolkit (微信小程序增强开发工具)


## 安装

```bash
npm i -g ewa-cli 或者 yarn add -g ewa-cli
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

## 功能特性

1. async/await 支持
2. Javascript ES2017 语法
3. 原生小程序所有功能
4. 微信接口 Promise 化
5. 支持安装 NPM 包
6. 支持 SCSS 以及 小于 16k 的 background-image
