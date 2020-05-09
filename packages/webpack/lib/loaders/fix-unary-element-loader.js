'use strict';

// 修复一元元素在压缩wxss的时候解析错误的问题
// 解决方案：重命名一元元素，等待压缩完成后，恢复之前的命名
// 仅适用于 wxml
const ELEMENT_MATCHER = /(<\/?)(area|base|basefont|br|col|embed|frame|hr|img|input|isindex|keygen|link|meta|param|source|track|wbr)( |>)/gi;
const REPLACER = '___unary___';
const REPLACER_MATCHER = /___unary___/g;
function fixUnaryElementLoader(content, map, meta) {
  // 如果包含替换后的一元元素，则删除占位符
  if (content && content.indexOf(REPLACER) !== -1) {
    content = content.replace(REPLACER_MATCHER, '');
  } else {
    // 反之，则添加占位符
    content = content.replace(ELEMENT_MATCHER, `$1${REPLACER}$2$3`);
  }
  this.callback(null, content, map, meta);
}

module.exports = fixUnaryElementLoader;