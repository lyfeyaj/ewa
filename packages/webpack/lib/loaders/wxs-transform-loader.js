'use strict';

module.exports = function wxsTransformLoader(content) {
  let { type } = this.query || {};

  if (type === 'alipay') {
    // alipay中， sjs仅支持esmodule导出
    content = content.replace(/module\.exports\s*=/, 'export default');
  }

  // 替换EWA_ENV
  content = content.replace(/process\.env\.EWA_ENV/g, `'${type}'`);

  return content;

};
