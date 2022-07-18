/* eslint-disable global-require */
const { existsSync } = require('fs');
const { join, sep, normalize } = require('path');

const requireFromApp = require('../../../helpers/require-from-app');
const appPaths = require('../../../helpers/app-paths');
const { QuasarSSRServerPlugin } = require('./plugin.server-side');
const { hasPackage } = require('../../../helpers/packages');
const WebpackProgressPlugin = require('../plugin.progress');

const nodeExternals = requireFromApp('webpack-node-externals');
const { NormalModuleReplacementPlugin } = requireFromApp('webpack');

function getModuleDirs() {
  const folders = [];
  let dir = appPaths.resolve.app('..');

  while (dir.length && dir[dir.length - 1] !== sep) {
    const newFolder = join(dir, 'node_modules');
    if (existsSync(newFolder)) {
      folders.push(newFolder);
    }

    dir = normalize(join(dir, '..'));
  }

  return folders;
}

const additionalModuleDirs = getModuleDirs();

module.exports = function chainWebpackServer(chain, cfg, configName) {
  requireFromApp('@quasar/app/lib/webpack/ssr/server')(chain, cfg);

  chain.name(configName);

  chain.output.delete('path');

  if (cfg.ctx.prod) {
    chain.output.path(cfg.ssg.buildDir);
  }

  if (cfg.ctx.prod) {
    chain.plugin('quasar-ssr-server')
      .use(QuasarSSRServerPlugin, [{
        filename: 'quasar.server-manifest.json',
      }]);
  }

  chain.plugin('runtime-inject-module-id').use(NormalModuleReplacementPlugin, [
    /runtime\.inject-module-id\.js/,
    join(__dirname, '../runtime-inject-module-id.js'),
  ]);

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

  if (hasPackage('quasar', '>= 2.6.1 ')
    && hasPackage('@quasar/extras', '>= 1.13.3')
    && hasPackage('@quasar/app-webpack', '>= 3.4.2 ')) {
    chain.externals(nodeExternals({
      // do not externalize:
      //  1. vue files
      //  2. CSS files
      //  3. when importing directly from Quasar's src folder
      allowlist: [
        /(\.(vue|css|styl|scss|sass|less)$|\?vue&type=style)/,
        ...cfg.build.transpileDependencies,
      ],
      additionalModuleDirs,
    }));
  }

  // work despite this commit
  // https://github.com/quasarframework/quasar/commit/425c451b7a0f71cdfd9fcf49b5a9caff18bfd398
  chain.optimization
    .concatenateModules(true);

  chain.plugin('progress')
    .use(WebpackProgressPlugin, [{ name: configName, cfg, hasExternalWork: false }]);
};
