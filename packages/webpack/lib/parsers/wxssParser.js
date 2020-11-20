'use strict';

module.exports = function wxssParser(content, type) {
  // 根据构建类型修改文件引入后缀名
  if (type === 'swan') content = content.replace(/\.wxss/g, '.css');
  if (type === 'tt') content = content.replace(/\.wxss/g, '.ttss');
  if (type === 'alipay') content = content.replace(/\.wxss/g, '.acss');

  return content;
};
