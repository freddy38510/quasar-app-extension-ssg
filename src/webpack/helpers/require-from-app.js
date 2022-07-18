/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { resolve } = require('./app-paths');

module.exports = (module) => require(resolve.appNodeModule(module));
