const { join } = require('path')

module.exports = (module, appDir) => require(join(appDir, 'node_modules', module))
