/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { existsSync } = require('fs');
const { join, sep, normalize } = require('path');
const RendererTemplatePlugin = require('./plugin.renderer-template');
const requireFromApp = require('../../../helpers/require-from-app');

const webpack = requireFromApp('webpack');
const WebpackChain = requireFromApp('webpack-chain');

const appPaths = requireFromApp('@quasar/app/lib/app-paths');
const WebpackProgress = requireFromApp('@quasar/app/lib/webpack/plugin.progress');
const nodeExternals = requireFromApp('webpack-node-externals');

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

module.exports = function createChain(cfg, configName) {
  const chain = new WebpackChain();
  const resolveModules = [
    appPaths.resolve.app('node_modules'),
    appPaths.resolve.cli('node_modules'),
  ];

  chain.target('node');
  chain.mode(cfg.ctx.prod ? 'production' : 'development');

  chain.resolve.alias.set('quasar$', 'quasar/dist/quasar.cjs.prod.js');

  chain.entry('renderer')
    .add(appPaths.resolve.app('.quasar/ssg-renderer-entry.js'));

  chain.output
    .filename('[name].js')
    .path(cfg.ssg.buildDir)
    .libraryTarget('commonjs2');

  chain.externals([
    nodeExternals({
      additionalModuleDirs,
    }),
    './template.html',
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

  // Scope hoisting ala Rollupjs
  if (cfg.build.scopeHoisting) {
    chain.optimization
      .concatenateModules(true);
  }

  if (cfg.build.showProgress) {
    chain.plugin('progress')
      .use(WebpackProgress, [{ name: configName }]);
  }

  chain.plugin('limitChunk')
    .use(webpack.optimize.LimitChunkCountPlugin, [{
      maxChunks: 1,
    }]);

  chain.plugin('renderer-template-plugin')
    .use(RendererTemplatePlugin, [cfg]);

  if (cfg.ctx.debug || (cfg.ctx.prod && cfg.build.minify !== true)) {
    // reset default webpack 4 minimizer
    chain.optimization.minimizers.delete('js');
    // also:
    chain.optimization.minimize(false);
  }

  chain.performance
    .hints(false);

  return chain;
};
