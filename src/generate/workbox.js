/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
const path = require('path');
const { merge } = require('webpack-merge');
const { generateSW, injectManifest } = require('workbox-build');
const { log } = require('../helpers/logger');

/*
function getAssetsExtensions (quasarConf) {
  const assets = require(path.join(
    quasarConf.build.distDir,
    'quasar.client-manifest.json'
  )).all

  return assets.map((asset) => path.extname(asset).slice(1)).join()
}
*/

module.exports = async function buildWorkbox(api, quasarConf, ctx) {
  const mode = quasarConf.pwa.workboxPluginMode;
  let defaultOptions = {
    sourcemap: ctx.debug,
  };

  if (mode === 'GenerateSW') {
    const pkg = require(api.resolve.app('package.json'));

    defaultOptions = {
      ...defaultOptions,
      cacheId: pkg.name || 'quasar-pwa-app',
      globPatterns: ['**/*.{js,css,html}'], // precache js, css and html files
      // globPatterns: [`**/*.{${getAssetsExtensions(quasarConf)},html}`], // precache all assets
      globIgnores: ['service-worker.js', 'workbox-*.js', 'asset-manifest.json'],
      directoryIndex: 'index.html',
      modifyURLPrefix: {
        '': quasarConf.build.publicPath,
      },
      // navigateFallback: false, // quasarConf.ssg.fallback,
      // sourcemap: false,
      // dontCacheBustURLsMatching: /(\.js$|\.css$|fonts\/)/,
    };

    log('[GenerateSW] Generating a service-worker file...');
  } else {
    log('[InjectManifest] Using your custom service-worker written file...');
  }

  // merge with custom options from user
  let opts = {
    ...defaultOptions,
    ...quasarConf.pwa.workboxOptions,
  };

  // if Object form:
  if (quasarConf.ssr.pwa && quasarConf.ssr.pwa !== true) {
    opts = merge(opts, quasarConf.ssr.pwa);
  }

  delete opts.exclude; // replaced by globIgnores with workbox-build

  if (mode === 'GenerateSW') {
    if (opts.navigateFallback === false) {
      delete opts.navigateFallback;
    } else if (opts.navigateFallback === void 0) {
      const htmlFile = quasarConf.build.ssrPwaHtmlFilename;

      opts.navigateFallback = `${quasarConf.build.publicPath}${htmlFile}`;

      opts.navigateFallbackDenylist = opts.navigateFallbackDenylist || [];
      opts.navigateFallbackDenylist.push(
        /service-worker\.js$/,
        /workbox-(.)*\.js$/,
      );
    }
  }

  opts.globDirectory = quasarConf.ssg.__distDir;
  opts.swDest = path.join(quasarConf.ssg.__distDir, 'service-worker.js');

  if (mode === 'GenerateSW') {
    await generateSW(opts);
  } else {
    // inject manifest to compiled service-worker.js
    opts.swSrc = opts.swDest;

    await injectManifest(opts);
  }
};
