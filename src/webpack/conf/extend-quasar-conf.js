/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
const { join, isAbsolute } = require('path');
const { merge } = require('webpack-merge');
const getUniqueArray = require('../helpers/get-unique-array');
const appPaths = require('../helpers/app-paths');
const requireFromApp = require('../helpers/require-from-app');

const extensionJson = requireFromApp('@quasar/app/lib/app-extension/extension-json');

module.exports = function extendQuasarConf(conf) {
  const prompts = extensionJson.getPrompts('ssg');

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
  conf.ssg.distDir = conf.ssg.distDir || join(appPaths.appDir, 'dist', 'ssg');

  if (!isAbsolute(conf.ssg.distDir)) {
    conf.ssg.distDir = join(appPaths.appDir, conf.ssg.distDir);
  }

  // Set SSG cache.ignore
  if (conf.ssg.cache !== false) {
    const ignore = [
      join(conf.ssg.distDir, '/**'),
      join(conf.ssg.buildDir, '/**'),
      ...conf.build.distDir ? [join(conf.build.distDir, '/**')] : [],
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
  }

  if (conf.ssg.inlineCriticalCss === void 0) {
    conf.ssg.inlineCriticalCss = prompts.inlineCriticalCss;
  }

  if (conf.ssg.inlineCssFromSFC === void 0) {
    conf.ssg.inlineCssFromSFC = prompts.inlineCssFromSFC;
  }

  if (conf.ctx.dev) {
    // force css inlining in development
    conf.build.extractCSS = false;
    conf.ssg.inlineCssFromSFC = true;

    // force disable beastcss
    // in development vue-style-loader remove styles at client-side before re-injecting it
    conf.inlineCriticalCss = false;
  }

  if (conf.ssg.shouldPrefetch === void 0) {
    conf.ssg.shouldPrefetch = () => false;
  }

  if (conf.ssg.shouldPreload === void 0) {
    conf.ssg.shouldPreload = () => false;
  }

  // Apply corrections to the body tag classes at client-side
  // because the client platform (mobile, desktop, ios, etc) is unknown at build-time.
  conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/ssg-corrections' });

  conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src[\\/]boot/);

  conf.build.htmlFilename = conf.ssg.fallback;

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback;

  conf.build.vueLoaderOptions = {
    compilerOptions: {
      whitespace: 'condense',
    },
  };

  if (conf.ctx.dev) {
    conf.devServer.client = conf.devServer.client || {};

    if (conf.devServer.client.webSocketTransport === undefined || typeof conf.devServer.client.webSocketTransport === 'string') {
      let customClient;

      if (conf.devServer.webSocketServer === 'sockjs' || conf.devServer.client.webSocketTransport === 'sockjs') {
        customClient = require.resolve('../dev/SockJSClient.js');
      } else {
        customClient = require.resolve('../dev/WebSocketClient.js');
      }

      conf.devServer.client.webSocketTransport = customClient;
    }
  }
};
