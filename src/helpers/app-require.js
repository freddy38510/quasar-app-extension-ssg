/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { appModule } = require('./app-paths');

module.exports = (module) => require(appModule(module));
