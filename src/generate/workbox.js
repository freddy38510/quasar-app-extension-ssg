/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
const path = require('path');
const { merge } = require('webpack-merge');
const { generateSW, injectManifest } = require('workbox-build');
const { log, warn } = require('../helpers/logger');
const { resolve } = require('../helpers/app-paths');

const getOptions = (quasarConf, mode) => {
  const defaultOptions = {
    dontCacheBustURLsMatching: /\.\w{8}\./,
    modifyURLPrefix: {
      '': quasarConf.build.publicPath,
    },
    globPatterns: ['**/*.{js,css,html}'], // precache js, css and html files
    globIgnores: ['service-worker.js', 'workbox-*.js', 'asset-manifest.json'],
    globDirectory: quasarConf.ssg.__distDir,
  };

  if (mode === 'GenerateSW') {
    const pkg = require(resolve.app('package.json'));

    defaultOptions.cacheId = pkg.name || 'quasar-pwa-app';
    defaultOptions.directoryIndex = 'index.html';
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
  opts.swDest = path.join(quasarConf.ssg.__distDir, 'service-worker.js');

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
  } else {
    opts.swSrc = opts.swDest;
  }

  return opts;
};

const handleWarnings = (warnings) => {
  if (warnings.length > 0) {
    warnings.forEach((workboxWarning) => {
      console.log();

      warn(workboxWarning);
    });
  }
};

const handleSuccess = (isGenerateSW, size, count, diffTime) => {
  const prefix = isGenerateSW ? 'Generated service-worker file' : 'Injected Manifest to custom service-worker file';

  log(`${prefix}, which will precache ${count} files, totaling ${(size / 1024).toFixed(2)} kB • ${diffTime}ms`, 'DONE');
};

module.exports = async function buildWorkbox(quasarConf) {
  const mode = quasarConf.pwa.workboxPluginMode;
  const isGenerateSW = mode === 'GenerateSW';
  const opts = getOptions(quasarConf, mode);
  const startTime = +new Date();

  let size = 0;
  let count = 0;
  let warnings = [];

  if (isGenerateSW) {
    log('Generating a service-worker file...');

    ({ size, count, warnings } = await generateSW(opts));
  } else {
    log('Injecting Manifest to custom service-worker file...');

    ({ size, count, warnings } = await injectManifest(opts));
  }

  const diffTime = +new Date() - startTime;

  handleWarnings(warnings);

  handleSuccess(isGenerateSW, size, count, diffTime);
};
