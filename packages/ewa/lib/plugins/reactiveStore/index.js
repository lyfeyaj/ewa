"use strict";

var createStore = require('./reactive');

module.exports = createStore;
/* 
  使用方法:
  1.创建store:对任意纯对象调用createStore使其响应式化（以app.js中globalData为例）
  // app.js
  const { createStore } = require('ewa');
  ...
  App({
    ...
    globalData: createStore ({
      a: 'old1',
      b: { 
        c: 'old2' 
      }
    })
  })

  2.改变globalData，globalData以及全局状态更新（支持嵌套属性和数组下标修改）
  // pageA.js
  Page({
    data: {
      a: '',
      b: { 
        c: '' 
      }
    }
  })

  onLoad() {
    App().globalData.a = 'new1' 
    console.log(this.data.a === 'new1')  // true

    App().globalData.b.c = 'new2'
    console.log(this.data.b.c === 'new2') // true
  }

  3.注入全局方法 使用示例:
  this.$on('test', (val) => { console.log(val) })

  this.$emit('test', 'value') // 'value'

  this.$once 使用方法同this.$on 只会触发一次

  this.$off('test') 解绑当前实例通过this.$on(...)注册的事件

  以上方法适用于 1.页面与页面 2.页面与组件 3.组件与组件
  注: 所有页面或组件销毁时会自动解绑所有的事件(无需使用this.$off(...))

  this.$set('coinName', '金币') 更新所有页面和组件data中'coinName'的值为'金币'（支持嵌套属性和数组下标修改）
 */