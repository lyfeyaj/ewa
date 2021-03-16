'use strict';

module.exports = function jsParser(content, type) {
  // NOTE: 替换为 swan / tt / alipay / qq，有些粗暴，需要优化
  // 强烈建议使用 ewa.api 来代替原生的接口调用对象
  // 考虑使用 babel 转换为语法树，然后替换，但需要消耗额外的转换性能
  if (type === 'swan') return content.replace(/wx\./gi, 'swan.');
  if (type === 'tt') return content.replace(/wx\./gi, 'tt.');
  if (type === 'alipay') return content.replace(/wx\./gi, 'my.');
  if (type === 'qq') return content.replace(/wx\./gi, 'qq.');

  return content;
};
