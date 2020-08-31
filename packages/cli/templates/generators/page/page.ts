const _App: any = getApp();
const isiPhoneX: boolean = _App.globalData.isiPhoneX;

Page({
  data: {
    isiPhoneX // 是否为iPhoneX以上机型
  },

  onLoad(options: any): void {
    this.loadOptions = options;
  }
});

export {};
