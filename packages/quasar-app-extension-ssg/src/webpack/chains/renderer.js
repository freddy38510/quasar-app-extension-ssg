const {
  join, sep, normalize,
} = require('path');
const { existsSync } = require('fs');
const webpack = require('webpack');
const WebpackChain = require('webpack-chain');
const nodeExternals = require('webpack-node-externals');
const appPaths = require('@quasar/app-webpack/lib/app-paths');
const injectNodeTypescript = require('@quasar/app-webpack/lib/webpack/inject.node-typescript');
const WebpackProgressPlugin = require('../plugins/progress');
const RenderTemplatePlugin = require('../plugins/render-template');

const nodeEnvBanner = 'process.env.NODE_ENV=\'development\';';

const flattenObject = (obj, prefix = 'process.env') => Object.keys(obj)
  .reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}.` : '';

    if (Object(obj[k]) === obj[k]) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = JSON.stringify(obj[k]);
    }

    return acc;
  }, {});

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

module.exports = function createRendererChain(cfg, configName) {
  const chain = new WebpackChain();

  const resolveModules = [
    appPaths.resolve.app('node_modules'),
    appPaths.resolve.cli('node_modules'),
  ];

  chain.target('node');
  chain.mode(cfg.ctx.prod ? 'production' : 'development');

  chain.entry('renderer')
    .add(appPaths.resolve.app('.quasar/ssg-renderer-entry.js'));

  chain.output
    .filename(cfg.ctx.dev ? 'create-renderer.js' : 'render-to-string.js')
    .path(cfg.ctx.dev ? appPaths.resolve.app('.quasar/ssg') : cfg.ssg.buildDir)
    .libraryTarget('commonjs2')
    .library({
      type: 'commonjs2',
      export: 'default',
    });

  chain.externals([
    nodeExternals({
      additionalModuleDirs,
    }),
    './render-template.js',
    './quasar.server-manifest.json',
    './quasar.client-manifest.json',
  ]);

  chain.node
    .merge({
      global: false,
      __dirname: false,
      __filename: false,
    });

  chain.module.rule('node')
    .test(/\.node$/)
    .use('node-loader')
    .loader('node-loader');

  chain.resolve.modules
    .merge(resolveModules);

  chain.resolve.extensions
    .merge(['.js', '.json', '.node']);

  chain.resolveLoader.modules
    .merge(resolveModules);

  chain.plugin('define')
    .use(webpack.DefinePlugin, [
      // flatten the object keys
      // example: some: { object } becomes 'process.env.some.object'
      { ...flattenObject(cfg.build.env), ...cfg.__rootDefines },
    ]);

  chain.plugin('define')
    .tap((args) => [{
      ...args[0],
      'process.env.CLIENT': false,
      'process.env.SERVER': true,
    }]);

  // we include it already in cfg.build.env
  chain.optimization
    .nodeEnv(false)
    .concatenateModules(true);

  injectNodeTypescript(cfg, chain);

  chain.plugin('limitChunk')
    .use(webpack.optimize.LimitChunkCountPlugin, [{
      maxChunks: 1,
    }]);

  // we need to set process.env.NODE_ENV to 'development'
  // in order for externalized vue/vuex/etc packages to run the
  // development code (*.cjs.js) instead of the prod one
  chain.plugin('node-env-banner')
    .use(webpack.BannerPlugin, [
      { banner: nodeEnvBanner, raw: true, entryOnly: true },
    ]);

  chain.plugin('render-template-plugin')
    .use(RenderTemplatePlugin, [cfg]);

  if (cfg.ctx.debug || (cfg.ctx.prod && cfg.build.minify !== true)) {
    // reset default webpack 4 minimizer
    chain.optimization.minimizers.delete('js');
    // also:
    chain.optimization.minimize(false);
  }

  chain.performance
    .hints(false);

  chain.plugin('progress')
    .use(WebpackProgressPlugin, [{ name: configName, cfg, hasExternalWork: true }]);

  return chain;
};
