const babel = require("babel-core")
const generate = require('@babel/generator').default

function ast ({ types: t }) {
  return {
    name: '移除wxs语法',
    visitor: {
      CallExpression (path) {
        let params = path.get('arguments')
        /*let code1 = generate(path.get('callee').node, {}).code.replace(/\.(\w)/g,  (match, $1) => $1.toUpperCase())
        let code2 = generate(params[0].node, {}).code

        console.log(code2 + code1)*/

        path.replaceWith(params[0])
      }
    }
  }
}

function transform(code) {
  // 第一次批量处理
  code =  babel.transform(code, {
    plugins: [
      ast
    ]
  }).code

  return code.trim().replace(/;$/, '')
}

module.exports = transform