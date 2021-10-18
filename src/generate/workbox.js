/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
const path = require('path');
const { merge } = require('webpack-merge');
const { generateSW, injectManifest } = require('workbox-build');
const {
  info, error, fatal, success, warn,
} = require('../helpers/logger');

const getOptions = (api, quasarConf, mode) => {
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
  } else {
    defaultOptions = {
      swSrc: api.resolve.app('.quasar/pwa/service-worker.js'),
    };
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

  return opts;
};

const handleError = (e, isGenerateSW, pill) => {
  const prefix = isGenerateSW ? 'Generated service-worker file' : 'Injected Manifest';

  error(`${prefix} with error`, 'DONE');

  console.error();

  console.error(e.stack || e);

  fatal('Please check the log above.', `${pill} FAILED`);
};

const handleWarnings = (warnings, pill) => {
  if (warnings.length > 0) {
    warnings.forEach((workboxWarning) => {
      console.log();

      warn(workboxWarning, `${pill} WARNING`);
    });
  }
};

const handleSuccess = (isGenerateSW, size, count, diffTime) => {
  const prefix = isGenerateSW ? 'Generated service-worker file' : 'Injected Manifest to custom service-worker file';

  success(`${prefix}, which will precache ${count} files, totaling ${(size / 1024).toFixed(2)} kB • ${diffTime}ms`, 'DONE');
};

module.exports = async function buildWorkbox(api, quasarConf) {
  const mode = quasarConf.pwa.workboxPluginMode;
  const isGenerateSW = mode === 'GenerateSW';
  const pill = `[${mode}]`;
  const opts = getOptions(api, quasarConf, mode);
  const startTime = +new Date();

  let size = 0;
  let count = 0;
  let warnings = [];

  try {
    if (isGenerateSW) {
      info('Generating a service-worker file...', 'WAIT');

      ({ size, count, warnings } = await generateSW(opts));
    } else {
      info('Injecting Manifest to custom service-worker file...', 'WAIT');

      ({ size, count, warnings } = await injectManifest(opts));
    }
  } catch (e) {
    handleError(e, isGenerateSW, pill);
  }

  const diffTime = +new Date() - startTime;

  handleWarnings(warnings, pill);

  handleSuccess(isGenerateSW, size, count, diffTime);
};
