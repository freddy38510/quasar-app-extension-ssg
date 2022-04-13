/* eslint-disable global-require */
const requireFromApp = require('../../../helpers/require-from-app');
const { QuasarSSRServerPlugin } = require('./plugin.server-side');

module.exports = function chainWebpackServer(chain, cfg) {
  requireFromApp('@quasar/app/lib/webpack/ssr/server')(chain, cfg);

  // QuasarSSRServerPlugin handles concatenated modules
  chain.optimization
    .concatenateModules(true);

  chain.plugin('quasar-ssr-server')
    .use(QuasarSSRServerPlugin, [{
      filename: '../quasar.server-manifest.json',
    }]);

  if (cfg.ssg.inlineCssFromSFC) {
    /**
    * replace vue-loader by @freddy38510/vue-loader
    * which has SSR critical CSS collection support
    * https://github.com/freddy38510/vue-loader/commit/d71c7925a3b35f658d461523cbb2b5be2aac9622
    */
    const { VueLoaderPlugin } = requireFromApp('@freddy38510/vue-loader');
    const vueRule = chain.module.rule('vue');

    vueRule.use('vue-loader').loader('@freddy38510/vue-loader');
    chain.plugin('vue-loader').use(VueLoaderPlugin);

    // support server-side style injection with vue-style-loader
    require('../inject.sfc-style-rules')(chain, {
      rtl: cfg.build.rtl,
      sourceMap: cfg.build.sourceMap,
      minify: cfg.build.minify,
      stylusLoaderOptions: cfg.build.stylusLoaderOptions,
      sassLoaderOptions: cfg.build.sassLoaderOptions,
      scssLoaderOptions: cfg.build.scssLoaderOptions,
      lessLoaderOptions: cfg.build.lessLoaderOptions,
    });
  }
};
