/* eslint-disable global-require */
const { join } = require('path');
const { merge } = require('webpack-merge');
const requireFromApp = require('../../helpers/require-from-app');
const { QuasarSSRClientPlugin } = require('./plugin.client-side');
const WebpackProgressPlugin = require('../plugin.progress');

module.exports = function chainWebpackClient(chain, cfg, configName) {
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
  const injectHtml = requireFromApp('@quasar/app/lib/webpack/inject.html');

  let templateParam;

  if (cfg.ctx.mode.pwa) {
    templateParam = JSON.parse(JSON.stringify(cfg.htmlVariables));

    templateParam.ctx.mode = { pwa: true };
    templateParam.ctx.modeName = 'pwa';
    if (templateParam.process && templateParam.process.env) {
      templateParam.process.env.MODE = 'pwa';
    }
  }

  injectHtml(chain, merge(cfg, {
    build: {
      distDir: cfg.ctx.mode.pwa ? cfg.ssg.buildDir : join(cfg.ssg.buildDir, 'www'),
    },
  }), templateParam);

  if (cfg.ctx.mode.pwa) {
    const HtmlPwaPlugin = require('../pwa/plugin.html-pwa').plugin;

    chain.plugin('html-pwa')
      .use(HtmlPwaPlugin, [cfg]);
  }

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
  }

  // support server-side style injection with vue-style-loader
  require('../inject.sfc-style-rules')(chain, {
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
};
