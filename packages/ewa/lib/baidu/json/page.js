let { 
  mapWindows
} = require('../util')

function pageJson (config) {
  config = mapWindows(config)


  return JSON.stringify(config,  null, 2)
}


module.exports = pageJson