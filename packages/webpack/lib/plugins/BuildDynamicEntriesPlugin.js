const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const ENTRY_DIR = path.join(ROOT, 'src');
const EWA_ENV = process.env.EWA_ENV || 'weapp';
const glob = require('glob');
const suffix = 'ts,js,json,wxml,scss,sass,less,wxss';

module.exports = class BuildDynamicEntriesPlugin {
  constructor() {
  }

  apply(compiler) {
    compiler.hooks.environment.tap('BuildDynamicEntriesPlugin', () => {
      compiler.options.entry = buildEntries(path.join(ENTRY_DIR, './app.json'));
    });
  }
}

function buildEntries(jsonPath) {
  const entries = {}

  const wxsFiles = glob.sync(
    path.join(ENTRY_DIR, '**/*.wxs')
  )

  // TODO templates文件夹暂时未按需动态加入entry， 用户可以重命名，从而导致丢失entry
  // 调整方案：在wxml文件中查询import标签，来动态引入入口文件（考虑将wxml转换成ast）
  const templateFiles = glob.sync(
    path.join(ENTRY_DIR, `templates/**/*.{${suffix}}`),
    { ignore: ['**/*.d.ts'] }
  )

  // 微信新出的自定义tabbar组件 (固定文件夹 custom-tab-bar)
  const customTabBar = glob.sync(
    path.join(ENTRY_DIR, `custom-tab-bar/*.{${suffix}}`),
    { ignore: ['**/*.d.ts'] }
  )

  const appFiles = glob.sync(
    path.join(ENTRY_DIR, `app.{${suffix}}`)
  )

  const content = fs.readFileSync(jsonPath, 'utf-8')

  // app.json json对象
  const appJson = JSON.parse(content)

  // app.json 中的 usingComponents路径数组
  const usingComponentPaths = Object.values(appJson.usingComponents || {})

  // 入口文件数组 存放绝对路径
  const entryPaths = [
    // TODO 需要支持多端 project.config.json
    path.resolve(`./src/${getProjectJsonName(EWA_ENV)}`),
    ...appFiles,
    ...templateFiles,
    ...customTabBar,
    ...wxsFiles
  ]

  // 所有json文件 存放绝对路径
  const jsonPaths = []

  /**
   * 将json文件中pages和usingComponents的path 处理到 entryPaths
   * paths: 对应 appJson中的pages,或者分包中的pages，或者components的路径数组
   * root: 相对路径转换为绝对路径的 对应目录
   * */
  const compilePath = (paths, root = '', eachCb) => {
    for (let i = 0; i < paths.length; i++) {
      let relativePath = paths[i];
      let absolutePath = path.join(`${root ? root + '/' : ''}${relativePath}`)
      let dirname = path.dirname(absolutePath)

      // 微信组件 忽略index写法时，自动补充index
      if (!/\/index$/.test(absolutePath) && !fs.existsSync(`${absolutePath}.json`)) {
        paths.push(`${relativePath}/index`)
      }

      entryPaths.push(...glob.sync(
        path.join(dirname, `*.{${suffix}}`),
        { ignore: ['**/*.d.ts'] }
      ))

      eachCb && eachCb(dirname)
    }
  }

  // 收集pages和components每个文件夹对应的json文件
  const saveJsonPath = (dirname) => {
    const absolutePaths = glob.sync(
      path.join(dirname, '*.json')
    )
    absolutePaths.forEach(path => {
      if (jsonPaths.indexOf(path) === -1) jsonPaths.push(path)
    })
  }

  // 将app.json中的 pages和 usingComponents加入entry
  compilePath([...appJson.pages, ...usingComponentPaths], ENTRY_DIR, (dirname) => saveJsonPath(dirname))

  // 将app.json中的 分包中的pages加入entry
  appJson.subPackages.forEach(package => {
    compilePath(package.pages, path.join(ENTRY_DIR, package.root), (dirname) => saveJsonPath(dirname))
  })

  // 将页面json文件中的usingComponents，加入entry
  // 注意组件的json文件中usingComponents，也需要加入entry
  for (let i = 0; i < jsonPaths.length; i++) {
    const absolutePath = jsonPaths[i]
    const content = fs.readFileSync(absolutePath, 'utf-8')
    const json = JSON.parse(content || '{}')
    const usingComponentPaths = Object.values(json.usingComponents || {})
    compilePath(usingComponentPaths, path.dirname(absolutePath), (dirname) => saveJsonPath(dirname))
  }

  // 将entryPaths转换成webpack的entry对象
  for (let i = 0; i < entryPaths.length; i++) {
    const absolutePath = entryPaths[i];

    let name = utils.resolveOrSimplifyPath(ENTRY_DIR, absolutePath, false)
    name = utils.chooseCorrectExtnameByBuildTarget(name, EWA_ENV)

    entries[name] = absolutePath
  }

  return entries
}

function getProjectJsonName(target) {
  return {
    weapp: 'project.config.json',
    swan: 'project.swan.json',
    tt: 'project.tt.json',
    alipay: 'project.alipay.json',
    qq: 'project.qq.json'
  }[target]
}