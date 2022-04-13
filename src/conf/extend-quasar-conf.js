/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
const { join, isAbsolute } = require('path');
const { merge } = require('webpack-merge');
const getUniqueArray = require('../helpers/get-unique-array');
const appPaths = require('../helpers/app-paths');

module.exports = function extendQuasarConf(conf, prompts) {
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
    crawler: true,
    exclude: [],
  }, conf.ssg ? conf.ssg : {});

  // Set SSG buildDir
  if (conf.ssg.buildDir === void 0) {
    conf.ssg.buildDir = conf.ssg.cache !== false
      ? appPaths.resolve.app('node_modules/.cache/quasar-app-extension-ssg') : appPaths.resolve.app('.ssg-build');
  }

  if (!isAbsolute(conf.ssg.buildDir)) {
    conf.ssg.buildDir = join(appPaths.appDir, conf.ssg.buildDir);
  }

  // Set SSG distDir
  conf.ssg.__distDir = conf.build.distDir || join(appPaths.appDir, 'dist', 'ssg');

  if (!isAbsolute(conf.ssg.__distDir)) {
    conf.ssg.__distDir = join(appPaths.appDir, conf.ssg.__distDir);
  }

  // Overrides it to expect build output folder in SSR mode being SSG buildDir
  conf.build.distDir = conf.ssg.buildDir;

  // Set SSG cache.ignore
  if (conf.ssg.cache !== false) {
    const ignore = [
      join(conf.ssg.__distDir, '/**'),
      join(conf.ssg.buildDir, '/**'),
      'dist/**',
      'public/**',
      'src-ssr/middlewares/**',
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
  }

  if (conf.ssg.inlineCriticalCss === void 0) {
    conf.ssg.inlineCriticalCss = prompts.inlineCriticalCss;
  }

  if (conf.ssg.inlineCssFromSFC === void 0) {
    conf.ssg.inlineCssFromSFC = prompts.inlineCssFromSFC;
  }

  if (conf.ssg.shouldPrefetch === void 0) {
    conf.ssg.shouldPrefetch = () => false;
  }

  if (conf.ssg.shouldPreload === void 0) {
    conf.ssg.shouldPreload = () => false;
  }

  // Set body tag classes (desktop/mobile, q-ios-padding, etc...) at client-side
  // The client platform is unknown at build-time
  conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/body-classes' });

  conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src[\\/]boot/);

  conf.build.htmlFilename = conf.ssg.fallback;

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback;

  conf.build.vueLoaderOptions = {
    compilerOptions: {
      whitespace: 'condense',
    },
  };
};
