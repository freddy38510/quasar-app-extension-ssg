const { join } = require('path');
const appPaths = require('../../helpers/app-paths');
const requireFromApp = require('../../helpers/require-from-app');
const WebpackProgressPlugin = require('../plugin.progress');

module.exports = function createCSW(cfg, configName) {
  const chain = requireFromApp('@quasar/app/lib/webpack/pwa/create-custom-sw')(cfg, configName);

  chain.name(configName);

  if (cfg.ctx.prod) {
    // workbox-webpack-plugin is not used and workbox-build does not compile the service worker
    // so, compile it for browser instead of nodejs like initially needed for workbox-webpack-plugin

    chain.target('webworker');

    chain.entryPoints.clear();

    chain.entry('service-worker').add(appPaths.resolve.app(cfg.sourceFiles.serviceWorker));

    chain.output
      .clear()
      .filename('[name].js')
      .path(join(cfg.ssg.buildDir, 'www'))
      .chunkFilename('[name].[chunkhash:8].js');

    chain.delete('externals');

    chain.optimization.splitChunks({
      cacheGroups: {
        workboxRuntime: {
          chunks: 'all',
          test: /workbox/,
          priority: -10,
          name: 'workbox',
          filename: 'js/[name].[contenthash:8].js',
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'all',
          reuseExistingChunk: true,
        },
      },
    });
  }

  chain.resolve.mainFields
    .clear()
    .add('module')
    .add('main');

  if (cfg.ctx.mode.prod && cfg.ctx.debug) {
    // this enable workbox debugging logger
    chain
      .plugin('define')
      .tap((args) => {
        args[0]['process.env.NODE_ENV'] = '"development"';

        return args;
      });
  }

  chain.plugin('progress')
    .use(WebpackProgressPlugin, [{ name: configName, cfg }]);

  return chain;
};
