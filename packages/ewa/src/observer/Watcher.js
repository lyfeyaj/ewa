const { isFunction } = require('./utils');
const Observer = require('./Observer');
const obInstance = Observer.getInstance();

let uid = 0;

class Watcher {
  constructor() {
    const argsData = arguments[0] ? arguments[0] : {};
    // 备份data数据
    this.$data = JSON.parse(JSON.stringify(argsData));
    // 更新函数
    this.updateFn = arguments[1] ? arguments[1] : {};
    // watcherId
    this.id = ++uid;
    // 收集data和globalData的交集作为响应式对象
    this.reactiveData = {};
    // 初始化
    this.initReactiveData();
    this.createObserver();
    // 收集watcher
    obInstance.setGlobalWatcher(this);
  }

  // 初始化数据并首次更新
  initReactiveData() {
    const props = Object.keys(this.$data);
    const { globalData } = getApp();
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (prop in globalData) {
        this.reactiveData[prop] = globalData[prop];
        this.update(prop, globalData[prop]);
      }
    }
  }

  // 添加订阅
  createObserver() {
    const props = Object.keys(this.reactiveData);
    if (props.length > 0) { 
      props.forEach(prop => {
        obInstance.onReactive(prop, this);
      });
    }
  }

  // 移除订阅
  removeObserver() {
    const props = Object.keys(this.reactiveData);
    if (props.length > 0) obInstance.removeReactive(props, this.id);
    // 移除相关事件及全局watcher
    obInstance.removeEvent(this.id);
    obInstance.removeWatcher(this.id);
  }

  // 更新数据和视图
  update(key, value) {
    if (isFunction(this.updateFn)) this.updateFn({ [key]: value });
  }
}

module.exports = Watcher;