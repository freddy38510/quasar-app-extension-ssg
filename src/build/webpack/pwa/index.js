/* eslint-disable no-void */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const requireFromApp = require('../../../helpers/require-from-app');
const appPaths = require('../../../helpers/app-paths');

const PwaManifestPlugin = requireFromApp('@quasar/app/lib/webpack/pwa/plugin.pwa-manifest');
const HtmlPwaPlugin = require('./plugin.html-pwa').plugin;

function addWorkboxPlugin(chain, cfg) {
  const WorkboxPlugin = requireFromApp('workbox-webpack-plugin');

  const defaultOptions = {
    dontCacheBustURLsMatching: /\.\w{8}\./,
  };

  const pluginMode = cfg.pwa.workboxPluginMode;
  const { log } = require('../../../helpers/logger');

  if (pluginMode === 'GenerateSW') {
    const pkg = require(appPaths.resolve.app('package.json'));

    defaultOptions.cacheId = pkg.name || 'quasar-pwa-app';
    defaultOptions.sourcemap = false;

    log('[GenerateSW] Will generate a service-worker file. Ignoring your custom written one.');
  } else {
    defaultOptions.swSrc = appPaths.resolve.app('.quasar/pwa/service-worker.js');

    log('[InjectManifest] Using your custom service-worker written file');
  }

  let opts = {
    ...defaultOptions,
    ...cfg.pwa.workboxOptions,
  };

  // dev resources are not optimized (contain maps, unminified code)
  // so they might be larger than the default maximum size for caching
  opts.maximumFileSizeToCacheInBytes = Number.MAX_SAFE_INTEGER;

  // if Object form:
  if (cfg.ctx.mode.pwa && cfg.ctx.mode.pwa !== true) {
    const { merge } = require('webpack-merge');
    opts = merge({}, opts, cfg.ctx.mode.pwa);
  }

  opts.exclude = opts.exclude || [];
  opts.exclude.push('../quasar.client-manifest.json', /hot-update\.json$/);

  if (pluginMode === 'GenerateSW') {
    if (opts.navigateFallback === false) {
      delete opts.navigateFallback;
    } else if (opts.navigateFallback === void 0) {
      const htmlFile = cfg.ssg.fallback;

      opts.navigateFallback = `${cfg.build.publicPath}${htmlFile}`;
      opts.navigateFallbackDenylist = opts.navigateFallbackDenylist || [];
      opts.navigateFallbackDenylist.push(/service-worker\.js$/, /workbox-(.)*\.js$/);
    }
  }

  opts.swDest = 'service-worker.js';

  chain.plugin('workbox')
    .use(WorkboxPlugin[pluginMode], [opts]);
}

module.exports = function chainWebpackClient(chain, cfg) {
  // write manifest.json file
  chain.plugin('pwa-manifest')
    .use(PwaManifestPlugin, [cfg]);

  chain.plugin('html-pwa')
    .use(HtmlPwaPlugin, [cfg]);

  if (cfg.ctx.dev) {
    addWorkboxPlugin(chain, cfg);
  }
};
