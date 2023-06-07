const { join } = require('path');
const createChain = require('@quasar/app-webpack/lib/webpack/create-chain');
const { QuasarSSRClientPlugin } = require('../plugins/client-side');
const WebpackProgressPlugin = require('../plugins/progress');

module.exports = function createClientChain(cfg, configName) {
  const chain = createChain(cfg, configName);

  chain.name(configName);

  chain.output.delete('path');

  if (cfg.ctx.prod) {
    chain.output
      .path(join(cfg.ssg.buildDir, 'www'));
  }

  // @see https://github.com/freddy38510/quasar-app-extension-ssg/issues/110
  chain.plugin('define').tap((args) => [{
    ...args[0],
    __QUASAR_SSR_PWA__: true,
  }]);

  if (cfg.ctx.prod) {
    chain.plugin('quasar-ssr-client')
      .use(QuasarSSRClientPlugin, [{
        filename: '../quasar.client-manifest.json',
      }]);
  }

  // Use webpack-html-plugin for creating html fallback file
  const injectHtml = require('./inject.html');

  injectHtml(chain, cfg);

  if (cfg.ctx.mode.pwa) {
    const HtmlPwaPlugin = require('../plugins/html-pwa').plugin;

    chain.plugin('html-pwa')
      .use(HtmlPwaPlugin, [cfg]);
  }

  if (cfg.ssg.inlineCssFromSFC) {
    /**
    * replace vue-loader by @freddy38510/vue-loader
    * which has SSR critical CSS collection support
    * https://github.com/freddy38510/vue-loader/commit/d71c7925a3b35f658d461523cbb2b5be2aac9622
    */
    const { VueLoaderPlugin } = require('@freddy38510/vue-loader');
    const vueRule = chain.module.rule('vue');

    vueRule.use('vue-loader').loader(require.resolve('@freddy38510/vue-loader'));
    chain.plugin('vue-loader').use(VueLoaderPlugin);
  }

  // support server-side style injection with vue-style-loader
  require('./inject.sfc-style-rules')(chain, {
    rtl: cfg.build.rtl,
    sourceMap: cfg.build.sourceMap,
    minify: cfg.build.minify,
    inlineCssFromSFC: cfg.ssg.inlineCssFromSFC,
    extract: cfg.build.extractCSS,
    stylusLoaderOptions: cfg.build.stylusLoaderOptions,
    sassLoaderOptions: cfg.build.sassLoaderOptions,
    scssLoaderOptions: cfg.build.scssLoaderOptions,
    lessLoaderOptions: cfg.build.lessLoaderOptions,
  });

  // work despite this commit
  // https://github.com/quasarframework/quasar/commit/425c451b7a0f71cdfd9fcf49b5a9caff18bfd398
  chain.optimization
    .concatenateModules(true);

  chain.plugin('progress')
    .use(WebpackProgressPlugin, [{ name: configName, cfg, hasExternalWork: false }]);

  return chain;
};
