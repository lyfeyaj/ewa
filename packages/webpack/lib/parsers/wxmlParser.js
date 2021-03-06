'use strict';

const htmlparser2 = require('htmlparser2');
const serialize = require('dom-serializer').default;
const path = require('path');
const utils = require('../utils');

/**
 * 转换 import 和 include 标签
 *
 * @param {Object} node 节点对象
 * @param {String} type 构建类型
 */
const FILE_TYPES_MAP = {
  tt: '.ttml',
  swan: '.swan',
  alipay: '.axml',
  qq: '.qml'
};

const WXS_TYPES_MAP = {
  tt: 'sjs',
  swan: 'sjs',
  alipay: 'sjs',
  qq: 'qs'
};

// 支付宝中 组件attr匹配命中前缀，需要更换写法 onXxxx catchXxxx
const prefixBindMatcher = /^bind:|bind/;
const prefixCatchMatcher = /^catch:|catch/;

function tranformImport(node, type) {
  if (node.name !== 'import' && node.name !== 'include') return;

  const attribs = node.attribs;
  if (!attribs.src) return;

  attribs.src = attribs.src.replace(/\.wxml$/i, FILE_TYPES_MAP[type]);

  // src中没有扩展名的添加默认扩展名.swan
  if (!/\w+\.\w+$/.test(attribs.src)) attribs.src = attribs.src + FILE_TYPES_MAP[type];
}

/**
 * 转换模板标签
 *
 * @param {Object} node 节点对象
 * @param {String} type 构建类型
 */
function tranformTemplate(node, type) {
  // 仅 百度小程序需要做这个转换
  if (type !== 'swan') return;
  if (node.name !== 'template') return;

  const attribs = node.attribs;
  if (!attribs.data) return;

  attribs.data = `{${attribs.data}}`;
}

/**
 * 转换wxs
 *
 * @param {Object} node 节点对象
 * @param {String} type 构建类型
 */
function transformWxs(node, type) {
  if (type === 'weapp') return;
  if (node.name === 'wxs') {

    const attribs = node.attribs;
    attribs.src = attribs.src.replace(/\.wxs$/i, `.${WXS_TYPES_MAP[type]}`);

    // 支付宝虽然文件名是sjs 但是标签是<import-sjs>
    if (type === 'alipay') {
      node.name = 'import-' + WXS_TYPES_MAP[type];
      attribs.name = attribs.module;
      attribs.from = attribs.src;
      delete attribs.module;
      delete attribs.src;
    } else {
      node.name = WXS_TYPES_MAP[type];
    }
  }
}

/**
 * 转换标签上的 directive
 *
 * @param {Object} node 节点对象
 * @param {String} type 构建类型
 */
const DIRECTIVES_MAP = {
  tt: {
    'wx:if': 'tt:if',
    'wx:elif': 'tt:elif',
    'wx:else': 'tt:else',

    'wx:for': 'tt:for',
    'wx:for-items': 'tt:for-items',
    'wx:for-item': 'tt:for-item',
    'wx:for-index': 'tt:for-index',
    'wx:key': 'tt:key'
  },
  swan: {
    'wx:if': 's-if',
    'wx:elif': 's-elif',
    'wx:else': 's-else',

    'wx:for': 's-for',
    'wx:for-items': 's-for',
    'wx:for-item': 's-for-item',
    'wx:for-index': 's-for-index',

    // swan don't support
    'wx:key': ''
  },
  alipay: {
    'wx:if': 'a:if',
    'wx:elif': 'a:elif',
    'wx:else': 'a:else',

    'wx:for': 'a:for',
    'wx:for-items': 'a:for-items',
    'wx:for-item': 'a:for-item',
    'wx:for-index': 'a:for-index',
    'wx:key': 'a:key',

    // 事件名称替换
    // NOTE: 更多兼容需要支持
    bindtouchstart: 'onTouchStart',
    bindtouchmove: 'onTouchMove',
    bindtouchend: 'onTouchEnd',
    bindtouchcancel: 'onTouchCancel',
    bindtap: 'onTap',
    bindlongtap: 'onLongTap',
    bindload: 'onLoad',
    bindchange: 'onChange',
    bindtransition: 'onTransition',
    bindanimationfinish: 'onAnimationEnd',
    bindscrolltoupper: 'onScrollToUpper',
    bindscrolltolower: 'onScrollToLower',
    bindscroll: 'onScroll',
    binddragstart: 'onTouchStart',
    binddragging: 'onTouchMove',
    binddragend: 'onTouchEnd',
    bindConfirm: 'onConfirm',

    'bind:touchstart': 'onTouchStart',
    'bind:touchmove': 'onTouchMove',
    'bind:touchend': 'onTouchEnd',
    'bind:touchcancel': 'onTouchCancel',
    'bind:tap': 'onTap',
    'bind:longtap': 'onLongTap',
    'bind:load': 'onLoad',
    'bind:change': 'onChange',
    'bind:transition': 'onTransition',
    'bind:animationfinish': 'onAnimationEnd',
    'bind:scrolltoupper': 'onScrollToUpper',
    'bind:scrolltolower': 'onScrollToLower',
    'bind:scroll': 'onScroll',
    'bind:dragstart': 'onTouchStart',
    'bind:dragging': 'onTouchMove',
    'bind:dragend': 'onTouchEnd',

    'catch:touchstart': 'catchTouchStart',
    'catch:touchmove': 'catchTouchMove',
    'catch:touchend': 'catchTouchEnd',
    'catch:touchcancel': 'catchTouchCancel',
    'catch:tap': 'catchTap',
    'catch:longtap': 'catchLongTap',
    'catch:load': 'catchLoad',
    'catch:change': 'catchChange',
    'catch:transition': 'catchTransition',
    'catch:animationfinish': 'catchAnimationEnd',
    'catch:scrolltoupper': 'catchScrollToUpper',
    'catch:scrolltolower': 'catchScrollToLower',
    'catch:scroll': 'catchScroll',
    'catch:dragstart': 'catchTouchStart',
    'catch:dragging': 'catchTouchMove',
    'catch:dragend': 'catchTouchEnd',

    'catchtouchstart': 'catchTouchStart',
    'catchtouchmove': 'catchTouchMove',
    'catchtouchend': 'catchTouchEnd',
    'catchtouchcancel': 'catchTouchCancel',
    'catchtap': 'catchTap',
    'catchlongtap': 'catchLongTap',
    'catchload': 'catchLoad',
    'catchchange': 'catchChange',
    'catchtransition': 'catchTransition',
    'catchanimationfinish': 'catchAnimationEnd',
    'catchscrolltoupper': 'catchScrollToUpper',
    'catchscrolltolower': 'catchScrollToLower',
    'catchscroll': 'catchScroll',
    'catchdragstart': 'catchTouchStart',
    'catchdragging': 'catchTouchMove',
    'catchdragend': 'catchTouchEnd',
  },
  qq: {
    'wx:if': 'qq:if',
    'wx:elif': 'qq:elif',
    'wx:else': 'qq:else',

    'wx:for': 'qq:for',
    'wx:for-items': 'qq:for-items',
    'wx:for-item': 'qq:for-item',
    'wx:for-index': 'qq:for-index',
    'wx:key': 'qq:key'
  }
};
const DIRECTIVES_MAP_KEYS = {};
Object.keys(DIRECTIVES_MAP).forEach(type => {
  DIRECTIVES_MAP_KEYS[type] = Object.keys(DIRECTIVES_MAP[type]);
});

function transformDirective(node, file, type) {
  let attribs = node.attribs;

  // swan 不支持绝对路径，这里部分替换为相对路径
  // 只能转换静态路径，动态拼接路径不支持转换
  if (node.name === 'image' && attribs.src) {
    if (!/^((\.\/)|(http))/.test(attribs.src)) {
      // 如果路径中包含判断逻辑，则不支持转换
      if (attribs.src.indexOf('{{') === -1) {
        let relativePath = path.relative('/' + path.dirname(file), attribs.src);
        attribs.src = relativePath;
      }
    }
  }

  // 百度小程序 swan 中不支持组件包含 type 属性
  if (type === 'swan' && ('type' in attribs)) {
    utils.log(
      `文件: \`${file}\` 中的 ${node.name} 元素包含 \`type\` 属性，会导致百度小程序报错，请替换属性名称`,
      'warning'
    );
  }

  // 替换对应的 directive
  DIRECTIVES_MAP_KEYS[type].forEach(attr => {
    if (!Object.prototype.hasOwnProperty.call(attribs, attr)) return;
    let newAttr = DIRECTIVES_MAP[type][attr];
    if (newAttr) {
      // 百度小程序需要删除花括号
      if (type === 'swan') {
        attribs[newAttr] = removeBrackets(attribs[attr]);
      }
      // 其他小程序仅需要做替换
      else {
        attribs[newAttr] = attribs[attr];
      }
    }

    delete attribs[attr];
  });

  // alipay中，需要对组件的函数传递处理 bind:xxxxx 改成 onXxxx
  if (type === 'alipay') {
    Object.keys(attribs).forEach(attr => {
      if (prefixBindMatcher.test(attr) || prefixCatchMatcher.test(attr)) {
        const newAttr = replaceCompAttr(attr);
        attribs[newAttr] = attribs[attr];
      }
    });
  }
}

/**
 * 将组件传递的函数的写法 转换为on:Xxxx
 * @param {string} oldAttr 原先属性值 bind:xxxx
 * @return {string} 处理后的属性值 onXxxx
 * */
function replaceCompAttr(oldAttr) {
  let newAttr = '';
  let prefix = '';
  if (prefixBindMatcher.test(oldAttr)) {
    newAttr = oldAttr.replace(prefixBindMatcher, '');
    prefix = 'on';
  } else {
    newAttr = oldAttr.replace(prefixCatchMatcher, '');
    prefix = 'catch';
  }
  newAttr = newAttr.replace(/^[a-zA-Z]{1}/, (s) => s.toUpperCase());
  return prefix + newAttr;
}

/**
 * 丢掉属性值两侧的花括号
 *
 * @param {string} value 属性值
 * @return {string}
 */
function removeBrackets(value) {
  // wx:else 情况排除
  if (typeof value !== 'string') return value;
  value = value.trim();
  if (/^{{.*}}$/.test(value)) return value.slice(2, -2).trim();

  return value;
}

/**
 * 判断是否{{}}数据绑定
 *
 * @param {string} value 属性值
 * @return {boolean}
 */
function hasBrackets(value = '') {
  const trimed = value.trim();
  return /^{{.*}}$/.test(trimed);
}

/**
 * for if 并存处理
 *
 * wx:for wx:if 并存 => wx:for 高优
 * eg:
 * <view wx:for='xx' wx:if='xx'>hello</view>  ->  <block wx:for="xxx"><view wx:if="xx">hello</view></block>
 *
 * wx:for wx:elif wx:else 并存 => wx:for 高优
 * eg:
 * <view wx:for='xx' wx:else>hello</view>  ->  <block wx:else><view wx:for="xxx">hello</view></block>
 */
const CONDITION_DIRECTIVES = ['wx:if', 'wx:elif', 'wx:else'];
const FOR_DIRECTIVES = ['wx:for', 'wx:for-items', 'wx:for-item', 'wx:for-index', 'wx:key'];
function curNodeTransformTwoNode(parentAttribs, curNode) {
  // copy curNode as new childNode
  let newChildNode = Object.assign(
    { prev: null, next: null },
    curNode
  );

  // curNode as parentNode
  let parentNode = Object.assign(
    curNode,
    { name: 'block', attribs: parentAttribs }
  );

  newChildNode.parent = parentNode;
  parentNode.children = [newChildNode];
}
function transformForIFDirective(node, type) {
  if (type !== 'swan') return;
  let attrs = node.attribs;
  if (!attrs['wx:for'] || !attrs['wx:if']) return;

  let parentAttribs = {};
  CONDITION_DIRECTIVES.some(conditionItem => {
    if (!attrs[conditionItem]) {
      return false;
    }

    // wx:if 时 for 高优
    if (conditionItem === CONDITION_DIRECTIVES[0]) {
      FOR_DIRECTIVES.forEach(forItem => {
        attrs[forItem] && (parentAttribs[forItem] = attrs[forItem]);
        delete attrs[forItem];
      });
    }

    // 其他时 for 低优
    else {
      parentAttribs[conditionItem] = attrs[conditionItem];
      delete attrs[conditionItem];
    }

    return true;
  });

  curNodeTransformTwoNode(parentAttribs, node);
}

/**
 * 转换数据绑定为双向绑定语法，仅百度小程序需要转换
 *
 * @param {Object} node 节点对象
 * @param {String} type 构建类型
 */
const BIND_DATA_MAP = {
  'scroll-view': ['scroll-top', 'scroll-left', 'scroll-into-view'],
  'input': ['value'],
  'textarea': ['value'],
  'movable-view': ['x', 'y'],
  'slider': ['value']
};
function tranformBindData(node, type) {
  // 仅百度小程序需要转换
  if (type !== 'swan') return;

  const attrs = BIND_DATA_MAP[node.name];
  if (!attrs) return;
  const attribs = node.attribs;
  attrs.forEach(attr => {
    if (!attribs[attr]) return;
    if (!hasBrackets(attribs[attr])) return;

    attribs[attr] = `{=${removeBrackets(attribs[attr])}=}`;
  });
}

/**
 * 转换style
 * 无请求头的css静态资源url添加https请求头
 *
 * @param {Object} node 节点对象
 */
function transformStyle(node) {
  const attribs = node.attribs;
  if (!attribs.style) return;
  attribs.style = transformCssStaticUrl(attribs.style);
}

/**
 * 无请求头的css静态资源url添加https请求头
 *
 * @param {string} content 文件内容
 * @return {string} 处理后文件内容
 */
function transformCssStaticUrl(content) {
  content = content.replace(/url\((.*)\)/g, function ($1, $2) {
    if (!$2) return $1;
    const res = $2.replace(/^(['"\s^]?)(\/\/.*)/, function ($1, $2, $3) {
      const resUrl = `${$2}https:${$3}`;
      return resUrl;
    });
    return `url(${res})`;
  });
  return content;
}

// 转换为 swan 抹平差异
function transformToTargetType(node, file, type) {
  if (Array.isArray(node)) return node.map(n => transformToTargetType(n, file, type));
  if (node.type !== 'tag') return node;

  node.attribs = node.attribs || {};
  node.children = node.children || [];

  tranformImport(node, type);
  tranformTemplate(node, type);
  tranformBindData(node, type);
  transformForIFDirective(node, type);
  transformDirective(node, file, type);
  transformStyle(node);
  transformWxs(node, type);

  node.children.map(n => transformToTargetType(n, file, type));

  return node;
}

// 转换 wxml 为 swan
module.exports = function wxmlParser(content = '', file = '', type = '') {
  let nodes = htmlparser2.parseDOM(
    content,
    {
      // 需要能够识别 自闭合标签
      xmlMode: false,
      decodeEntities: false,
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
      recognizeCDATA: true,
      recognizeSelfClosing: true,
    }
  );

  // 转换为 目标构建平台 支持
  nodes = transformToTargetType(nodes, file, type);

  let html = serialize(
    nodes,
    {
      selfClosingTags: true,
      xmlMode: false,
      decodeEntities: false
    }
  );

  // NOTE: 文本替换 &quot; => '
  // 由于wxml代码编写不规范，导致单双引号混用，解析时无法正确还原
  // 由于每个属性都检查一遍比较消耗性能，这里直接做替换，可能会导致显示的问题
  // eslint-disable-next-line quotes
  return html.replace(/&quot;/g, "'");
};
