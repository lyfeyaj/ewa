const appJson = require('./app')
const pageJson = require('./page')
const componentJson = require('./component')



module.exports = function (data, isAppJson) {
  let config = JSON.parse(data)


  if (isAppJson) {
    return appJson(config)
  }  

  if (config.component) {
    return componentJson(config)
  } 
  
  return pageJson(config)
}