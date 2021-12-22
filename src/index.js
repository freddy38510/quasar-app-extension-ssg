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

const { join, isAbsolute, resolve } = require('path');
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
    conf.ssg.inlineCssFromSFC = api.prompts.inlineCssFromSFC || false;
  }

  if (conf.ssg.inlineCriticalCss === void 0) {
    conf.ssg.inlineCriticalCss = api.prompts.inlineCriticalCss || true;
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

const chainWebpack = function chainWebpack({ isClient, isServer }, chain, api, quasarConf) {
  if (chain.plugins.has('vue-loader')) {
    chain
      .plugin('vue-loader')
      .tap((options) => [...options, {
        compilerOptions: {
          preserveWhitespace: false,
        },
      }]);
  }

  if (quasarConf.ssg.inlineCssFromSFC) {
    /* Replace 'quasar-auto-import' loaders
     *
     * Quasar has two distinct loaders 'quasar-auto-import', one for client and one server
     * This breaks vue-style-loader ssrId option
     */
    if (quasarConf.framework.importStrategy === 'auto') {
      const vueRule = chain.module.rule('vue');

      if (vueRule.uses.has('quasar-auto-import')) {
        vueRule.uses.delete('quasar-auto-import');
      }

      vueRule.use('quasar-auto-import')
        .loader(resolve(__dirname, './webpack/loader.auto-import.js'))
        .options({ api, componentCase: quasarConf.framework.autoImportComponentCase, isServer })
        .before('vue-loader');
    }

    // Inject missing rules to support vue-style-loader for Vue SFC
    require('./webpack/inject.sfc-style-rules')(api, chain, {
      rtl: quasarConf.build.rtl,
      sourceMap: quasarConf.build.sourceMap,
      minify: quasarConf.build.minify,
      isServer,
      stylusLoaderOptions: quasarConf.build.stylusLoaderOptions,
      sassLoaderOptions: quasarConf.build.sassLoaderOptions,
      scssLoaderOptions: quasarConf.build.scssLoaderOptions,
      lessLoaderOptions: quasarConf.build.lessLoaderOptions,
    });
  }

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
      // This breaks beastcss html parser
      chain.plugins.delete('html-pwa');

      chain.plugin('html-pwa')
        .use(HtmlPwaPlugin.plugin, [api, quasarConf]);

      if (quasarConf.pwa.workboxPluginMode === 'InjectManifest') {
        const filename = chain.output.get('filename');

        // Compile custom service worker to /service-worker.js
        chain
          .entry('service-worker')
          .add(api.resolve.app(quasarConf.sourceFiles.serviceWorker));

        chain.output.filename((pathData) => (pathData.chunk.name === 'service-worker' ? '[name].js' : filename));
      }
    }
  }

  if (isServer) {
    const SsrArtifacts = require('./webpack/plugin.ssr-artifacts');

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
      chainWebpack({ isClient, isServer }, chain, api, quasarConf);
    });

    // Webserver is not used with SSG
    api.chainWebpackWebserver((chain) => chain.plugins.delete('progress'));
  } else {
    api.extendQuasarConf((conf) => {
      conf.build.env.STATIC = false;
    });
  }
};
