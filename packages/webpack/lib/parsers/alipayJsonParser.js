const TAB_BAR_LIST_MAPPER = {
  pagePath: 'pagePath',
  text: 'name',
  iconPath: 'icon',
  selectedIconPath: 'activeIcon'
};

const WINDOW_ATTR_MAPPER = {
  navigationBarBackgroundColor: 'titleBarColor',
  navigationBarTitleText: 'defaultTitle',
  enablePullDownRefresh: 'pullRefresh'
};

// 支付宝平台 app.json
// 1. 无tabBar.list，需要改为items字段，并且属性名称需要兼容
// 2. window下的属性也需要映射
module.exports = function alipayJsonParser(json, type) {
  if (type !== 'alipay') return json;

  tabBarParser(json);
  windowParser(json);

  return json;
};

// tabBar 属性兼容
function tabBarParser(json) {
  if (!json.tabBar) return;

  json.tabBar.items = (json.tabBar.list || []).map(bar => {
    const item = {};
    Object.keys(TAB_BAR_LIST_MAPPER).forEach(key => item[TAB_BAR_LIST_MAPPER[key]] = bar[key]);
    return item;
  });
}

// app.json的window属性和页面json的属性兼容
function windowParser(json) {
  const pageConfig = json.pages ? (json.window || {}) : (json || {});

  Object.keys(WINDOW_ATTR_MAPPER).forEach(key => {
    pageConfig[WINDOW_ATTR_MAPPER[key]] = pageConfig[key];
    delete pageConfig[key];
  });

  // 支付宝小程序 自定义导航栏 字段为transparentTitle
  if (pageConfig.navigationStyle === 'custom') {
    pageConfig.transparentTitle = 'always';
    // 导航栏设置透明后，还会显示标题，为了保持和微信小程序体验一致， 删除json文件中的标题字段
    delete pageConfig.defaultTitle;
    delete pageConfig.navigationBarTitleText;
  } else if (pageConfig.navigationStyle === 'default') {
    pageConfig.transparentTitle = 'none';
  }
  delete pageConfig.navigationStyle;

  // 打开下拉刷新的同时，必须将allowsBounceVertical属性设置为'YES'
  if (pageConfig.pullRefresh) {
    pageConfig.allowsBounceVertical = 'YES';
  }

  // 默认支持导航栏点击穿透
  pageConfig.titlePenetrate = pageConfig.titlePenetrate || 'YES';
}
