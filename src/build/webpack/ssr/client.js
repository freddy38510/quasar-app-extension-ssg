/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
const { join, resolve } = require('path');
const { merge } = require('webpack-merge');
const requireFromApp = require('../../../helpers/require-from-app');
const { hasPackage } = require('../../../helpers/packages');
const WebpackProgress = require('../plugin.progress');

module.exports = function chainWebpackClient(chain, cfg) {
  requireFromApp('@quasar/app/lib/webpack/ssr/client')(chain, cfg);

  if (cfg.build.showProgress) {
    chain.plugins.delete('progress');

    chain.plugin('progress')
      .use(WebpackProgress, [{ name: 'Client' }]);
  }

  if (hasPackage('@quasar/app', '< 2.0.0')) {
    const VueSSRClientPlugin = requireFromApp('vue-server-renderer/client-plugin');

    chain.plugins.delete('vue-ssr-client');

    chain.plugin('vue-ssr-client')
      .use(VueSSRClientPlugin, [{
        filename: '../quasar.client-manifest.json',
      }]);
  }

  if (!cfg.ctx.mode.pwa) {
    // Use webpack-html-plugin for creating html fallback file
    const injectHtml = requireFromApp('@quasar/app/lib/webpack/inject.html');

    injectHtml(chain, merge(cfg, {
      build: {
        distDir: join(cfg.build.distDir, 'www'),
      },
    }));
  } else {
    if (hasPackage('@quasar/app', '< 1.9.0')) {
      if (cfg.ctx.mode.ssr && cfg.ctx.mode.pwa) {
        // this will generate the offline.html
        // which runs as standalone PWA only
        // so we need to tweak the ctx

        const injectHtml = requireFromApp('@quasar/app/lib/webpack/inject.html');

        const templateParam = JSON.parse(JSON.stringify(cfg.__html.variables));

        templateParam.ctx.mode = { pwa: true };
        templateParam.ctx.modeName = 'pwa';
        if (templateParam.process && templateParam.process.env) {
          templateParam.process.env.MODE = 'pwa';
        }

        injectHtml(chain, merge(cfg, {
          build: {
            distDir: join(cfg.build.distDir, 'www'),
          },
        }), templateParam);
      }
    }
    const HtmlPwaPlugin = require('../pwa/plugin.html-pwa');
    // Handle workbox after build instead of during webpack compilation
    // This way all assets could be precached, including generated html
    chain.plugins.delete('workbox');
    // The meta tags inserted have close tags resulting in invalid HTML markup
    // This breaks beastcss html parser
    chain.plugins.delete('html-pwa');

    chain.plugin('html-pwa')
      .use(HtmlPwaPlugin.plugin, [cfg]);
  }

  if (chain.plugins.has('vue-loader')) {
    chain
      .plugin('vue-loader')
      .tap((options) => [...options, {
        compilerOptions: {
          preserveWhitespace: false,
        },
      }]);
  }

  if (cfg.ssg.inlineCssFromSFC) {
    /* Replace 'quasar-auto-import' loaders
     *
     * Quasar has two distinct loaders 'quasar-auto-import', one for client and one server
     * This breaks vue-style-loader ssrId option
     */

    if (hasPackage('@quasar/app', '>= 2.0.0') ? cfg.framework.importStrategy === 'auto' : cfg.framework.all === 'auto') {
      const vueRule = chain.module.rule('vue');

      if (vueRule.uses.has('quasar-auto-import')) {
        vueRule.uses.delete('quasar-auto-import');
      }

      vueRule.use('quasar-auto-import')
        .loader(resolve(__dirname, '../loader.auto-import.js'))
        .options({ componentCase: cfg.framework.autoImportComponentCase, isServer: false })
        .before('vue-loader');
    }

    // Inject missing rules to support vue-style-loader for Vue SFC
    require('../inject.sfc-style-rules')(chain, {
      rtl: cfg.build.rtl,
      sourceMap: cfg.build.sourceMap,
      minify: cfg.build.minify,
      isServer: false,
      stylusLoaderOptions: cfg.build.stylusLoaderOptions,
      sassLoaderOptions: cfg.build.sassLoaderOptions,
      scssLoaderOptions: cfg.build.scssLoaderOptions,
      lessLoaderOptions: cfg.build.lessLoaderOptions,
    });
  }
};
