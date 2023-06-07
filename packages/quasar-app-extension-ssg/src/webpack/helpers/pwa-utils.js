const { join } = require('path');
const appPaths = require('@quasar/app-webpack/lib/app-paths');
const {
  info,
  error,
  fatal,
  success,
  warn,
} = require('./logger');

const getOptions = (quasarConf, mode) => {
  const defaultOptions = {
    dontCacheBustURLsMatching: /\.\w{8}\./,
  };

  if (mode === 'GenerateSW') {
    const pkg = require(appPaths.resolve.app('package.json'));

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
        /workbox\.(.)*\.js$/,
      );
    }
  } else {
    opts.swSrc = join(quasarConf.ssg.buildDir, 'www/service-worker.js');
  }

  opts.globDirectory = quasarConf.ssg.distDir;
  opts.swDest = join(quasarConf.ssg.distDir, 'service-worker.js');

  return opts;
};

function displayError(e, mode, pill) {
  error(`Failed to ${mode === 'GenerateSW' ? 'generate Service Worker file' : 'inject the precache manifest'}`, 'DONE');

  console.error();

  console.error(e);

  fatal('Please check the log above.', `${pill} FAILED`);
}

function displayWarnings(warnings, pill) {
  if (warnings.length > 0) {
    warnings.forEach((workboxWarning) => {
      console.log();

      warn(workboxWarning, `${pill} WARNING`);
    });
  }
}

function displaySuccess(mode, size, count, diffTime) {
  const prefix = mode === 'GenerateSW' ? 'Service Worker file generated' : 'Precache Manifest injected to custom service-worker file';

  success(`${prefix}, which will precache ${count} files, totaling ${(size / 1024).toFixed(2)} kB • ${diffTime}ms`, 'DONE');
}

module.exports.buildPwaServiceWorker = async function buildPwaServiceWorker(quasarConf) {
  const mode = quasarConf.pwa.workboxPluginMode;
  const pill = `[${mode === 'GenerateSW'
    ? 'Service Worker'
    : 'Precache Manifest'}]`;
  const opts = getOptions(quasarConf, mode);
  const startTime = +new Date();

  info(mode === 'GenerateSW' ? 'Compiling of the Service Worker file with Workbox in progress...' : 'Injecting the Precache Manifest to the custom Service Worker with Workbox in progress..', 'WAIT');

  const diffTime = +new Date() - startTime;

  try {
    // uncapitalized mode string
    const workboxMethodName = mode.charAt(0).toLowerCase() + mode.slice(1);

    const { size, count, warnings } = await require('workbox-build')[workboxMethodName](opts);

    displayWarnings(warnings, pill);

    displaySuccess(mode, size, count, diffTime);
  } catch (e) {
    displayError(e, mode, pill);
  }
};
