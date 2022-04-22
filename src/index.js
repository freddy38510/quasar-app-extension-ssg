/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const { join, isAbsolute } = require('path');
const { merge } = require('webpack-merge');
const getUniqueArray = require('./helpers/get-unique-array');

const extendQuasarConf = function extendQuasarConf(conf, api) {
  conf.ssg = merge({
    concurrency: 10,
    interval: 0,
    fallback: '404.html',
    cache: {
      ignore: [],
      globbyOptions: {
        gitignore: true,
      },
    },
    routes: [],
    rendererOptions: {},
    crawler: true,
    exclude: [],
  }, conf.ssg ? conf.ssg : {});

  // Set SSG distDir
  conf.ssg.__distDir = conf.build.distDir || join(api.appDir, 'dist', 'ssg');

  if (!isAbsolute(conf.ssg.__distDir)) {
    conf.ssg.__distDir = join(api.appDir, conf.ssg.__distDir);
  }

  // Set SSG buildDir
  if (!conf.ssg.buildDir) {
    if (conf.ssg.cache !== false) {
      conf.ssg.buildDir = api.resolve.app('node_modules/.cache/quasar-app-extension-ssg');
    } else {
      conf.ssg.buildDir = api.resolve.app('.ssg-build');
    }
  }

  if (!isAbsolute(conf.ssg.buildDir)) {
    conf.ssg.buildDir = join(api.appDir, conf.ssg.buildDir);
  }

  // Overrides it to expect build output folder in SSR mode being our SSG buildDir
  conf.build.distDir = conf.ssg.buildDir;

  if (conf.ssg.inlineCssFromSFC === void 0) {
    conf.ssg.inlineCssFromSFC = api.prompts.inlineCssFromSFC;
  }

  if (conf.ssg.inlineCriticalCss === void 0) {
    conf.ssg.inlineCriticalCss = api.prompts.inlineCriticalCss;
  }

  // Set SSG cache.ignore
  if (conf.ssg.cache !== false) {
    const ignore = [
      join(conf.ssg.__distDir, '/**'),
      join(conf.ssg.buildDir, '/**'),
      'dist/**',
      'public/**',
      'src-ssr/**',
      'src-cordova/**',
      'src-electron/**',
      'src-bex/**',
      'node_modules/**',
      '.**/*',
      '.*',
      'README.md',
    ];

    if (typeof conf.ssg.cache.ignore === 'function') {
      conf.ssg.cache.ignore = conf.ssg.cache.ignore(ignore);
    } else if (Array.isArray(conf.ssg.cache.ignore)) {
      conf.ssg.cache.ignore = getUniqueArray(conf.ssg.cache.ignore.concat(ignore));
    }

    // Needed for PWA InjectManifest mode
    conf.sourceFiles.serviceWorker = conf.sourceFiles.serviceWorker || 'src-pwa/custom-service-worker.js';
  }

  // Set body tag classes (desktop/mobile, q-ios-padding, ...) at client-side
  // The platform used is unknown at build time when pre-rendering pages.
  conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/body-classes' });

  conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src/);

  conf.build.htmlFilename = conf.ssg.fallback;

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback;

  conf.build.vueRouterMode = 'history';

  conf.build.env.STATIC = true;
};

module.exports = function run(api) {
  api.compatibleWith('quasar', '^1.7.1');

  api.compatibleWith('@quasar/app', '^1.5.0||^2.0.0');
  
  api.registerCommand('generate', () => require('./bin/ssg-generate'));

  api.registerCommand('inspect', () => require('./bin/inspect'));

  api.registerCommand('serve', () => require('./bin/server'));

  // Apply SSG modifications only if current process has "ssg" argument
  if (process.argv[2] === 'ssg') {
    api.extendQuasarConf((conf) => {
      extendQuasarConf(conf, api);
    });
  } else {
    api.extendQuasarConf((conf) => {
      conf.build.env.STATIC = false;
    });
  }
};
