const appRequire = require('../helpers/app-require');
const { resolve } = require('../helpers/app-paths');

module.exports = (quasarConf, webpackConf) => {
  const webpack = appRequire('webpack');

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
      'quasar-app-extension-ssg/src/webpack/fake-vue-component.js',
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
