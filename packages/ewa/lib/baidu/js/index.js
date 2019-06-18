
function jsTobaidu (code) {
	// 替换标签样式
  let result =code.replace(/wx./g,"swan.")

	return result;
}

module.exports = jsTobaidu;
