const fs = require('fs')

const loader = (dir = '/assets/images/') => {
  var files = fs.readdirSync(dir)
  return files
}

module.exports = loader
