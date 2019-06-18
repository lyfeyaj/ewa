const HtmlDom = require('htmldom');
const removeWxs = require('./ast');
const TAGS = [
	{
		src: 'header',
		dest: 'view'
	},
	{
		src: 'footer',
		dest: 'view'
	}
];

// 属性替换
const ATTRIBUTES = [
	{
		src: 'wx:if',
		dest: 's-if'
	},
	{
		src: 'wx:elif',
		dest: 's-elif'
	},
	{
		src: 'wx:else',
		dest: 's-else'
	},
	{
		src: 'wx:for',
		dest: 's-for'
	},
	{
		src: 'wx:for-items',
		dest: 's-for'
	},
	{
		src: 'wx:for-index',
		dest: 's-for-index'
	},
	{
		src: 'wx:for-item',
		dest: 's-for-item'
	},
	{
		src: 'wx:key',
		dest: 's-key'
	}
];

// function setAttributes (key, value) {
// 	value = value.replace(/"/g, '&quot;');

// 	return `${key}="${value}"`;
// }

// template处理
function templateWrap (item) {
	var children = item.children.filter(item => item.type === 'tag');

	// 子节点是block标签
	if (children.length === 1 && children[0].name === 'block') {
		children[0].name = 'view';
	}
}

// function wxForAndwxIf (item, $item) {
// 	// 这几个属性迁移
// 	let attrs = ['wx:for', 'wx:for-index', 'wx:for-item', 'wx:key'];
// 	let html = [`<${item.name}`];

// 	for (let key in item.attributes) {
// 		if (!attrs.includes(key)) {
// 			let oldValue = item.attributes[key];
// 			$item.attr(key, null);
// 			html.push(' ' + setAttributes(key, oldValue));
// 		}
// 	}

// 	html.push(`>${$item.html()}</${item.name}>`);

// 	item.name = 'block';
// 	$item.html(html.join(''));
// }

// .wxml替换成.axml
function srcReplace ($item) {
	let oldSrc = $item.attr('src');

	if (oldSrc) {
		$item.attr('src', oldSrc.replace(/\.wxml$/, '.swan'));
	}
}

// 事件替换
function attrsReplace ($item, attrs) {
	ATTRIBUTES.forEach(({
		src,
		dest
	}) => {
		let old = $item.attr(src);

		if (typeof old !== 'undefined') {
			attrs[src] = null;
			attrs[dest] = old ? old : '';
		}
	});
}


function validate ($, warn) {
	$('[wx:key]').each((index, item) => {
		let value = $(item).attr('wx:key');

		if (value.includes('.')) {
			warn.push(`wx:key不能嵌套属性, ${value}`);
		} else if (value.includes('{{')) {
			warn.push(`wx:key不能使用花括号, ${value}`);
		}
	});

	if ($('a').length) {
		warn.push('a标签不支持');
	}

	if ($('del').length) {
		warn.push('del标签不支持');
	}
}

// function dataToLowerCase (attrs) {
// 	let upReg = /[A-Z]/;
// 	for (let key in attrs) {
// 		if (key.startsWith('data-')) {
// 			if (upReg.test(key)) {
// 				attrs[key.toLowerCase()] = attrs[key];
// 				delete attrs[key];
// 			}
// 		}
// 	}
// }

function wxmlToAxml (code, {
	warn
} = {}) {
	console.log("变更前",code);
	let html = new HtmlDom(code);
	let $ = html.$;
	console.log("变更hz ",html);


	if (warn) {
		validate($, warn);
	}

	$('wxs').remove();

	// template 的子节点只能是一个而不是多个
	$('template').each((index, item) => {
		templateWrap(item, $);
	});

	// image不能使用catchtap
	// image不支持svg文件
	// $('image').each((index, item) => {
	// 	let $item = $(item);

	// 	imageCatch(item, $item);

	// 	if (svgToImage) {
	// 		let oldSrc = $item.attr('src')

	// 		if (oldSrc) {
	// 			$item.attr('src', oldSrc.replace(/([^./]+\.)svg$/, '_svg/$1png'))
	// 		}
	// 	}
	// })

	// button组件处理
	// $('button').each((index, item) => {
	// 	let $item = $(item)


	// 	if (!$item.attr('hover-class')) {
	// 		$item.attr('hover-class', 'none')
	// 	}
	// })

	// picker-view移除自定义样式
	// $('picker-view').each((index, item) => {
	// 	let $item = $(item)

	// 	$item.removeClass().addClass('alipay_picker_view')
	// 	$item.find('picker-view-column > *').removeClass().addClass('alipay_picker_view_item')
	// })

	// map子元素迁移
	// $('map').each((index, item) => {
	// 	let $item = $(item)
	// 	let child = $item.html().trim()

	// 	child && $item.html('').after(child)
	// })

	// $('*').each((index, item) => {
	// var $item = $(item);

	// if ($item.attr('wx:for') && $item.attr('wx:if')) {
	// 	wxForAndwxIf(item, $item);
	// }

	// data-xx 属性强制小写
	// dataToLowerCase(item.attributes);
	// });

	$('*').each((index, item) => {
		var $item = $(item);
		let attrs = {};


		attrsReplace($item, attrs);

		srcReplace($item);

		TAGS.forEach(({
			src,
			dest
		}) => {
			if (item.name === src) {
				item.name = dest;
				// 控制标签css
				$item.addClass(`swan_${src}`);
			}
		});


		$item.attr(attrs);
	});

	let result = html.html({
		selfClosed: true
	});

	result = result.replace(/\{\{([\s\S]+?)\}\}/g, (match, $1) => {
		try {
			let code = removeWxs($1);
			return `{{${code}}}`;
		} catch (e) {
			return match;
		}
	});

	return result;
}


module.exports = wxmlToAxml;
