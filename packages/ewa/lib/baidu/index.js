const path = require('path');
const argv = process.argv;
const wxToSwan = require('../index');

if (argv.length < 3) {
	throw new Error('缺少参数');
}

argv.shift();

let params = {};

argv.forEach(item => {
	let [key, value] = item.split('=');
	if (value !== undefined) {
		params[key.replace(/^--/, '')] = value;
	}
});

if (!params.src) {
	throw new Error('缺少--src参数');
}

if (params.filter) {
	params.filter = params.filter.split(',');
}

if (params.callback) {
	let callbackPath = require(path.join(params.src, params.callback));
	params.callback = callbackPath;
}

wxToSwan(params);
