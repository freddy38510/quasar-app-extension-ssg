/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
const path = require('path');
const { green } = require('chalk');
const { generateSW, injectManifest } = require('workbox-build');
const { log } = require('../helpers/logger');
const { resolve } = require('../helpers/app-paths');

const getOptions = (quasarConf, mode) => {
  const defaultOptions = {
    dontCacheBustURLsMatching: /\.\w{8}\./,
  };

  if (mode === 'GenerateSW') {
    const pkg = require(resolve.app('package.json'));

    defaultOptions.cacheId = pkg.name || 'quasar-pwa-app';
    defaultOptions.directoryIndex = 'index.html';
    defaultOptions.sourcemap = quasarConf.build.sourceMap;
  }

  // merge with custom options from user
  let opts = {
    ...defaultOptions,
    ...quasarConf.pwa.workboxOptions,
  };

  // if Object form:
  if (quasarConf.ssr.pwa && quasarConf.ssr.pwa !== true) {
    const { merge } = require('webpack-merge');
    opts = merge(opts, quasarConf.ssr.pwa);
  }

  delete opts.exclude; // replaced by globIgnores with workbox-build
  opts.globIgnores = opts.globIgnores || [];
  opts.globIgnores.push('service-worker.js', '**/workbox-*.js', '**/workbox.*.js', '**/manifest.*.js', '**/*.map');

  if (mode === 'GenerateSW') {
    if (opts.navigateFallback === false) {
      delete opts.navigateFallback;
    } else if (opts.navigateFallback === void 0) {
      const htmlFile = quasarConf.ssg.fallback;

      opts.navigateFallback = `${quasarConf.build.publicPath}${htmlFile}`;

      opts.navigateFallbackDenylist = opts.navigateFallbackDenylist || [];
      opts.navigateFallbackDenylist.push(
        /service-worker\.js$/,
        /workbox-(.)*\.js$/,
      );
    }
  } else {
    opts.swSrc = path.join(quasarConf.ssg.buildDir, 'www/service-worker.js');
  }

  opts.globDirectory = quasarConf.ssg.__distDir;
  opts.swDest = path.join(quasarConf.ssg.__distDir, 'service-worker.js');

  return opts;
};

const handleWarnings = (warnings) => {
  if (warnings.length > 0) {
    console.warn();

    warnings.forEach((err) => {
      console.warn(err.stack || err);
    });
  }
};

const handleSuccess = (isGenerateSW, size, count, diffTime) => {
  const prefix = isGenerateSW ? 'service-worker file generated' : 'Manifest injected to custom service-worker file';

  log(green(`${prefix}, which will precache ${count} files, totaling ${(size / 1024).toFixed(2)} kB • ${diffTime}ms`));
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
