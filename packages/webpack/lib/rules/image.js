'use strict';

// 处理图片, 小程序不支持本地的背景图片, 这里采用 base64 编码的 datauri
module.exports = function imageRule() {
  return {
    test: /\.(jpe?g|png|gif|ico|svg|webp|apng)$/i,
    use: [
      {
        loader: 'url-loader',
        options: {
          // 16k
          limit: 8192 * 2
        }
      }
    ]
  };
};