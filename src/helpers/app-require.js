/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { join } = require('path');

module.exports = (module, appDir) => require(join(appDir, 'node_modules', module));
