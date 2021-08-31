/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
const path = require('path');
const { merge } = require('webpack-merge');
const { generateSW, injectManifest } = require('workbox-build');
const { info, success } = require('../helpers/logger');

module.exports = async function buildWorkbox(api, quasarConf) {
  const mode = quasarConf.pwa.workboxPluginMode;
  let defaultOptions = {};

  if (mode === 'GenerateSW') {
    const pkg = require(api.resolve.app('package.json'));

    defaultOptions = {
      cacheId: pkg.name || 'quasar-pwa-app',
      globPatterns: ['**/*.{js,css,html}'], // precache js, css and html files
      globIgnores: ['service-worker.js', 'workbox-*.js', 'asset-manifest.json', '../quasar.client-manifest.json'],
      directoryIndex: 'index.html',
      modifyURLPrefix: {
        '': quasarConf.build.publicPath,
      },
    };

    // log('[GenerateSW] Generating a service-worker file...');
    info('Generating a service-worker file...', 'WAIT');
  } else {
    defaultOptions = {
      swSrc: api.resolve.app('.quasar/pwa/service-worker.js'),
    };
    info('Injecting manifest to your custom service-worker written file...', 'WAIT');

    // log('[InjectManifest] Using your custom service-worker written file...');
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

  const startTime = +new Date();

  if (mode === 'GenerateSW') {
    await generateSW(opts);

    const diffTime = +new Date() - startTime;

    success(`service-worker file generated with success • ${diffTime}ms`, 'DONE');

    return;
  }

  await injectManifest(opts);

  const diffTime = +new Date() - startTime;

  success(`Manifest injected with success • ${diffTime}ms`, 'DONE');
};
