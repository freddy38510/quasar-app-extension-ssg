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
const appRequire = require('./helpers/app-require');
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
    crawler: true,
    exclude: [],
  }, conf.ssg ? conf.ssg : {});

  // Set SSG buildDir
  if (conf.ssg.buildDir === void 0) {
    conf.ssg.buildDir = conf.ssg.cache !== false
      ? api.resolve.app('node_modules/.cache/quasar-app-extension-ssg') : api.resolve.app('.ssg-build');
  }

  if (!isAbsolute(conf.ssg.buildDir)) {
    conf.ssg.buildDir = join(api.appDir, conf.ssg.buildDir);
  }

  // Set SSG distDir
  conf.ssg.__distDir = conf.build.distDir || join(api.appDir, 'dist', 'ssg');

  if (!isAbsolute(conf.ssg.__distDir)) {
    conf.ssg.__distDir = join(api.appDir, conf.ssg.__distDir);
  }

  // Overrides it to expect build output folder in SSR mode being our SSG buildDir
  conf.build.distDir = conf.ssg.buildDir;

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
  }

  // Set body tag classes (desktop/mobile, q-ios-padding, ...) at client-side
  // The platform used is unknown at build time when pre-rendering pages.
  conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/body-classes' });

  conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src/);

  conf.build.htmlFilename = conf.ssg.fallback;

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback;

  conf.build.env.STATIC = true;
};

const chainWebpack = function chainWebpack(chain, { isClient, isServer }, api, quasarConf) {
  if (isClient) {
    if (!api.ctx.mode.pwa) {
      // Use webpack-html-plugin for creating html fallback file
      const injectHtml = appRequire('@quasar/app/lib/webpack/inject.html', api.appDir);

      const cfg = merge(quasarConf, {
        build: {
          distDir: join(quasarConf.build.distDir, 'www'),
        },
      });

      injectHtml(chain, cfg);
    } else {
      const HtmlPwaPlugin = require('./webpack/plugin.html-pwa');
      // Handle workbox after build instead of during webpack compilation
      // This way all assets could be precached, including generated html
      chain.plugins.delete('workbox');
      // The meta tags inserted have close tags resulting in invalid HTML markup
      chain.plugins.delete('html-pwa');

      chain.plugin('html-pwa')
        .use(HtmlPwaPlugin.plugin, [quasarConf, api]);
    }
  }

  if (isServer) {
    const SsrArtifacts = require('./webpack/plugin.ssr-artifacts');

    const cfg = merge(quasarConf, {
      build: {
        minify: false, // Minify later when generating pre-rendered pages to avoid to do it twice
      },
    });

    chain.plugin('ssr-artifacts')
      .use(SsrArtifacts, [cfg, api]);
  }
};

module.exports = function run(api) {
  api.registerCommand('generate', () => require('./bin/ssg-generate')(api));

  api.registerCommand('inspect', () => require('./bin/inspect')(api));

  api.registerCommand('serve', () => require('./bin/server')(api));

  // Apply SSG modifications only if current process has "ssg" argument
  if (api.ctx.prod && api.ctx.mode.ssr && process.argv[2] === 'ssg') {
    let quasarConf = {};

    api.extendQuasarConf((conf) => {
      extendQuasarConf(conf, api);

      quasarConf = conf;
    });

    api.chainWebpack((chain, { isClient, isServer }) => {
      chainWebpack(chain, { isClient, isServer }, api, quasarConf);
    });

    // Webserver is not used with SSG
    api.chainWebpackWebserver((chain) => chain.plugins.delete('progress'));
  } else {
    api.extendQuasarConf((conf) => {
      conf.build.env.STATIC = false;
    });
  }
};
