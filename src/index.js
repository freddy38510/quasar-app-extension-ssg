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
    conf.ssg.inlineCriticalCss = api.prompts.inlineCriticalCss;
  }

  if (conf.ssg.inlineCssFromSFC === void 0) {
    conf.ssg.inlineCssFromSFC = api.prompts.inlineCssFromSFC;
  }

  if (conf.ssg.shouldPrefetch === void 0) {
    conf.ssg.shouldPrefetch = () => false;
  }

  if (conf.ssg.shouldPreload === void 0) {
    conf.ssg.shouldPreload = (_file, asType) => ['font'].includes(asType);
  }

  // Set body tag classes (desktop/mobile, q-ios-padding, etc...) at client-side
  // The client platform is unknown at build-time
  conf.boot.push({ server: false, path: '~quasar-app-extension-ssg/src/boot/body-classes' });

  conf.build.transpileDependencies.push(/quasar-app-extension-ssg[\\/]src/);

  conf.build.htmlFilename = conf.ssg.fallback;

  conf.build.ssrPwaHtmlFilename = conf.ssg.fallback;

  conf.build.vueLoaderOptions = {
    compilerOptions: {
      whitespace: 'condense',
    },
  };

  conf.build.env.STATIC = true;
};

const chainWebpack = function chainWebpack(chain, { isClient, isServer }, api, quasarConf) {
  const SsrArtifacts = require('./webpack/plugin.ssr-artifacts');
  const { QuasarSSRClientPlugin } = require('./webpack/plugin.client-side');
  const { QuasarSSRServerPlugin } = require('./webpack/plugin.server-side');

  // @see https://github.com/freddy38510/quasar-app-extension-ssg/issues/110
  chain.plugin('define').tap((args) => [{
    ...args[0],
    __QUASAR_SSR_PWA__: true,
  }]);

  // QuasarSSRServerPlugin handles concatenated modules
  chain.optimization
    .concatenateModules(true);

  if (quasarConf.ssg.inlineCssFromSFC) {
    /**
    * replace vue-loader by @freddy38510/vue-loader
    * which has SSR critical CSS collection support
    * https://github.com/freddy38510/vue-loader/commit/d71c7925a3b35f658d461523cbb2b5be2aac9622
    */
    const { VueLoaderPlugin } = appRequire('@freddy38510/vue-loader', api.appDir);
    const vueRule = chain.module.rule('vue');

    vueRule.use('vue-loader').loader('@freddy38510/vue-loader');
    chain.plugin('vue-loader').use(VueLoaderPlugin);

    // support server-side style injection with vue-style-loader
    require('./webpack/inject.sfc-style-rules')(api, chain, {
      isServerBuild: isServer,
      rtl: quasarConf.build.rtl,
      sourceMap: quasarConf.build.sourceMap,
      minify: quasarConf.build.minify,
      stylusLoaderOptions: quasarConf.build.stylusLoaderOptions,
      sassLoaderOptions: quasarConf.build.sassLoaderOptions,
      scssLoaderOptions: quasarConf.build.scssLoaderOptions,
      lessLoaderOptions: quasarConf.build.lessLoaderOptions,
    });
  }

  if (isClient) {
    chain.plugin('quasar-ssr-client')
      .use(QuasarSSRClientPlugin, [api, {
        filename: '../quasar.client-manifest.json',
      }]);

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
        .use(HtmlPwaPlugin.plugin, [api, quasarConf]);
    }
  }

  if (isServer) {
    chain.plugin('quasar-ssr-server')
      .use(QuasarSSRServerPlugin, [api, {
        filename: '../quasar.server-manifest.json',
      }]);

    chain.plugin('ssr-artifacts')
      .use(SsrArtifacts, [api, quasarConf]);
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
  } else {
    api.extendQuasarConf((conf) => {
      conf.build.env.STATIC = false;
    });
  }
};
