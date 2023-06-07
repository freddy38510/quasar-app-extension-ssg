const { webpackNames } = require('@quasar/app-webpack/lib/webpack/symbols');

webpackNames.ssg = {
  renderer: 'Renderer',
  serverSide: webpackNames.ssr.serverSide,
  clientSide: webpackNames.ssr.clientSide,
};

module.exports.webpackNames = webpackNames;

module.exports.splitWebpackConfig = function splitWebpackConfig(webpackConfigs, mode) {
  return Object.keys(webpackNames[mode])
    .filter((name) => webpackConfigs[name] !== void 0)
    .map((name) => ({
      name: webpackNames[mode][name],
      webpack: webpackConfigs[name],
    }));
};
