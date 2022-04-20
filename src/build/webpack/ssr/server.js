/* eslint-disable global-require */
const { resolve } = require('path');

const requireFromApp = require('../../../helpers/require-from-app');

module.exports = function chainWebpackServer(chain, cfg) {
  requireFromApp('@quasar/app/lib/webpack/ssr/server')(chain, cfg);

  chain.plugins.delete('ssr-artifacts');

  if (cfg.ssg.inlineCssFromSFC) {
    /* Replace 'quasar-auto-import' loaders
     *
     * Quasar has two distinct loaders 'quasar-auto-import', one for client and one server
     * This breaks vue-style-loader ssrId option
     */
    if (cfg.framework.importStrategy === 'auto') {
      const vueRule = chain.module.rule('vue');

      if (vueRule.uses.has('quasar-auto-import')) {
        vueRule.uses.delete('quasar-auto-import');
      }

      vueRule.use('quasar-auto-import')
        .loader(resolve(__dirname, '../loader.auto-import.js'))
        .options({ componentCase: cfg.framework.autoImportComponentCase, isServer: true })
        .before('vue-loader');
    }

    // Inject missing rules to support vue-style-loader for Vue SFC
    require('../inject.sfc-style-rules')(chain, {
      rtl: cfg.build.rtl,
      sourceMap: cfg.build.sourceMap,
      minify: cfg.build.minify,
      isServer: true,
      stylusLoaderOptions: cfg.build.stylusLoaderOptions,
      sassLoaderOptions: cfg.build.sassLoaderOptions,
      scssLoaderOptions: cfg.build.scssLoaderOptions,
      lessLoaderOptions: cfg.build.lessLoaderOptions,
    });
  }
};
