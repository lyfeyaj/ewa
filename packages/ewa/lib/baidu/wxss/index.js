const CssDom = require('CssDom');


function tagReplace (selectors) {
	let tagReg = /^(header|footer)([.#:][\w-()]+)?$/;

	return selectors.map(child => {
		let tags = child.split(' ');

		return tags.map((child2) => {
			return child2.replace(tagReg, '.swan_$1$2');
		}).join(' ');
	});
}

function pathReplace (code) {
	return code.replace(/\.wxss/g, '.css');
}


function wxssToAcss (code) {
	// 替换标签样式
	let css = new CssDom(code);

	css.dom.forEach(item => {
		if (item.type === 'rule') {
			item.selectors = tagReplace(item.selectors);
		} else if (item.type === 'import') {
			item.value = pathReplace(item.value);
		}
	});

	let result = css.beautify();

	return result;
}


module.exports = wxssToAcss;