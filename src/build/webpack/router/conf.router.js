const requireFromApp = require('../../../helpers/require-from-app');
const { resolve } = require('../../../helpers/app-paths');

module.exports = (quasarConf, webpackConf) => {
  const webpack = requireFromApp('webpack');

  const entryFile = resolve.app(quasarConf.sourceFiles.router);

  const newConf = { ...webpackConf };

  delete newConf.devtool;

  newConf.output = {
    ...webpackConf.output,
    filename: 'compiled-router.js',
    path: quasarConf.ssg.buildDir,
  };

  newConf.entry = {
    router: [entryFile],
  };

  const pluginsToRemove = [
    'VueLoaderPlugin',
    'WebpackProgressPlugin',
    'BootDefaultExport',
    'QuasarSSRServerPlugin',
    'SsrProdArtifacts',
    'ESLintWebpackPlugin',
  ];

  newConf.plugins = [...webpackConf.plugins
    .filter((plugin) => !pluginsToRemove.includes(plugin.constructor.name))];

  newConf.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /\.vue$/,
      'quasar-app-extension-ssg/src/build/webpack/router/fake-vue-component.js',
    ),
  );

  newConf.plugins.push(
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  );

  newConf.optimization = {
    nodeEnv: false,
    concatenateModules: true,
    minimize: false,
  };

  newConf.performance = {
    ...webpackConf.performance,
    hints: false,
  };

  return newConf;
};
