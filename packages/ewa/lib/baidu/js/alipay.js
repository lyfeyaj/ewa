const APIMAP = {
  request: 'httpRequest',
  setNavigationBarTitle: 'setNavigationBar',
  setNavigationBarColor: 'setNavigationBar'
}
const helpers = require('./helpers')

module.exports =  function ({ types: t }) {

  function APIReplace (path) {
    let name = path.get('property.name').node
    let map = APIMAP[name]

    if (map) {
      path.get('property').replaceWith(t.Identifier(map))
    }
  }

  function requirePath (path) {
    let params = path.get('arguments')[0]

    if (!params) {
      throw path.buildCodeFrameError(`require缺少参数`)
    }
    
    let name = params.get('value').node.replace(/\.js$/, '')
    let reg = /^[\w$]/

     if (reg.test(name)) {
      name = `./${name}`
    }

    params.replaceWith(t.StringLiteral(name))
  }

  // 动态 wx[name](options)
  function invoke (path) {
    let name = path.get('callee.property')
    let params = path.get('arguments')

    path.replaceWith(helpers.invoke(name.node, params))
  }

  // 静态 wx.request()
  function staticInvoke (path) {
    let name  = path.get('callee.property.name').node
    let params = path.get('arguments')

    path.replaceWith(helpers.invoke(t.StringLiteral(name), params))
  }

  return {
    name: '微信Js转支付宝Js',
    pre () {
      this.cache = new Map()
    },
    visitor: {
      MemberExpression (path, state) {
        let name = path.get('object.name').node
        let relative = state.opts.relative

        switch (name) {
          case 'wx':
            APIReplace(path)
            break
          case 'Reflect':
            this.cache.set('reflect', relative)
            break
        }
      },
      CallExpression (path) {
        let caller = path.get('callee')

        if (caller.isMemberExpression()) {
          if (caller.get('object.name').node == 'wx') {
            if (caller.get('computed').node) {
              invoke(path)
            } else {
              staticInvoke(path)
            }
          }
        }

        if (caller.isIdentifier() && caller.get('name').node === 'require') {
          requirePath(path)
        }
      },
      StringLiteral (path) {
        let str = path.get('value').node

        if (str === 'wxMin') {
          path.replaceWith(t.StringLiteral('alipay'))
        }
      },

      Identifier (path) {
        let name = path.get('name').node

        if (
            name === 'wx' && 
            !path.scope.hasBinding('wx') && 
            path.isReferencedIdentifier()
          ) {
          path.replaceWith(t.Identifier('my'))
        }
      }
    },
    post (state) {
      let relative = this.cache.get('reflect')
      // state.ast.program.body
      let body = state.ast.program.body

      if (relative) {
        body.unshift(helpers.requireReflect(relative))
      }
    }
  };
  
}