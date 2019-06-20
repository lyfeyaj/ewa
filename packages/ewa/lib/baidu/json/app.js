const path = require('path')
let { 
  mapWindows
} = require('../util')

function appConfig (config) {
  let {
    pages,
    subPackages,
    tabBar,
    window: windowConfig
  } = config

  if (subPackages) {
    subPackages.forEach(item => {
      item.pages.forEach(child => {
        pages.push(path.join(item.root, child))
      })
    })
    delete config.subPackages
  }


  if (tabBar) {
    let items = tabBar.list.map(({
      iconPath: icon,
      selectedIconPath: activeIcon,
      pagePath,
      text: name
    }) => {
      return {
        pagePath,
        icon,
        activeIcon,
        name
      }
    })

    config.tabBar = {
      textColor: tabBar.color,
      selectedColor: tabBar.selectedColor,
      backgroundColor: tabBar.backgroundColor,
      items
    }
  }

  if (windowConfig) {
    config.window = mapWindows(windowConfig)
  }

  return JSON.stringify(config,  null, 2)
}

module.exports = appConfig