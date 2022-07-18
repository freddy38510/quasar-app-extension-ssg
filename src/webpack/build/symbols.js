/* eslint-disable no-void */
const requireFromApp = require('../helpers/require-from-app');

const { webpackNames } = requireFromApp('@quasar/app/lib/webpack/symbols');

webpackNames.ssg = {
  renderer: 'Renderer',
  serverSide: webpackNames.ssr.serverSide,
  clientSide: webpackNames.ssr.clientSide,
};

function splitWebpackConfig(webpackConfigs, mode) {
  return Object.keys(webpackNames[mode])
    .filter((name) => webpackConfigs[name] !== void 0)
    .map((name) => ({
      name: webpackNames[mode][name],
      webpack: webpackConfigs[name],
    }));
}

module.exports.webpackNames = webpackNames;
module.exports.splitWebpackConfig = splitWebpackConfig;
