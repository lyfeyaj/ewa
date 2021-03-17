'use strict';

module.exports = function fixRegeneratorLoader(content = '') {
  // 小程序环境不支持 Function, 支付宝会报错, 故这里删除这一行代码
  if (/Function\("r", ?"regeneratorRuntime = r"\)/g.test(content)) {
    return content.replace(/Function\("r", ?"regeneratorRuntime = r"\)/g, '');
  }

  return content;
};





