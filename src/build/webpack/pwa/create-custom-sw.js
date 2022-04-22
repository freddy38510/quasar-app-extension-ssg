/* eslint-disable no-underscore-dangle */
const path = require('path');
const requireFromApp = require('../../../helpers/require-from-app');
const { resolve: { appNodeModule } } = require('../../../helpers/app-paths');
const { hasPackage } = require('../../../helpers/packages');
const WebpackProgress = require('../plugin.progress');

const appPaths = requireFromApp('@quasar/app/lib/app-paths');
const webpack = requireFromApp('webpack');
const WebpackChain = requireFromApp('webpack-chain');

function getDependenciesRegex(list) {
  const deps = list.map((dep) => {
    if (typeof dep === 'string') {
      return path.join('node_modules', dep, '/')
        .replace(/\\/g, '[\\\\/]'); // windows support
    }

    // dep instanceof RegExp
    return dep.source;
  });

  return new RegExp(deps.join('|'));
}

module.exports = function createCSW(cfg, configName) {
  const chain = new WebpackChain();

  const resolveModules = [
    'node_modules',
    appPaths.resolve.app('node_modules'),
  ];

  chain.entry('custom-sw').add(
    appPaths.resolve.app(cfg.sourceFiles.serviceWorker),
  );
  chain.mode(cfg.ctx.dev ? 'development' : 'production');
  chain.devtool(cfg.build.sourceMap ? cfg.build.devtool : false);

  chain.output
    .filename('service-worker.js')
    .path(path.join(cfg.ssg.buildDir, 'www'));

  chain.resolve.symlinks(false);

  chain.resolve.extensions
    .merge(
      cfg.supportTS !== false
        ? ['.mjs', '.ts', '.js', '.json', '.wasm']
        : ['.mjs', '.js', '.json', '.wasm'],
    );

  chain.resolve.modules
    .merge(resolveModules);

  chain.resolve.alias
    .merge({
      src: appPaths.srcDir,
      app: appPaths.appDir,
    });

  chain.resolveLoader.modules
    .merge(resolveModules);

  if (hasPackage('@quasar/app', '>= 2.0.0') ? cfg.framework.importStrategy === 'auto' : cfg.framework.all === 'auto') {
    if (hasPackage('@quasar/app', '>= 1.9.0')) {
      chain.module.rule('transform-quasar-imports')
        .test(/\.(t|j)sx?$/)
        .use('transform-quasar-imports')
        .loader(appNodeModule('@quasar/app/lib/webpack/loader.transform-quasar-imports.js'));
    }
  }

  if (cfg.build.transpile === true) {
    const nodeModulesRegex = /[\\/]node_modules[\\/]/;
    const exceptionsRegex = getDependenciesRegex(
      [/\.vue\.js$/, 'quasar', '@babel/runtime']
        .concat(cfg.build.transpileDependencies),
    );

    chain.module.rule('babel')
      .test(/\.js$/)
      .exclude
      .add((filepath) => (
        // Transpile the exceptions:
        exceptionsRegex.test(filepath) === false
        // Don't transpile anything else in node_modules:
        && nodeModulesRegex.test(filepath)
      ))
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        compact: false,
        extends: appPaths.resolve.app('babel.config.js'),
        ...hasPackage('@quasar/app', '< 1.9.0')
          ? {
            plugins: cfg.framework.all !== true ? [
              [
                'transform-imports', {
                  quasar: {
                    transform: 'quasar/dist/babel-transforms/imports.js',
                    preventFullImport: true,
                  },
                },
              ],
            ] : [],
          } : {},
      });
  }

  if (cfg.supportTS !== false) {
    chain.resolve.extensions
      .merge(['.ts']);

    chain.module
      .rule('typescript')
      .test(/\.ts$/)
      .use('ts-loader')
      .loader('ts-loader')
      .options({
        onlyCompileBundledFiles: true,
        transpileOnly: false,
        // While `noEmit: true` is needed in the tsconfig preset to prevent VSCode errors,
        // it prevents emitting transpiled files when run into node context
        compilerOptions: {
          noEmit: false,
        },
      });
  }

  chain.module // fixes https://github.com/graphql/graphql-js/issues/1272
    .rule('mjs')
    .test(/\.mjs$/)
    .type('javascript/auto')
    .include
    .add(/[\\/]node_modules[\\/]/);

  if (hasPackage('@quasar/app', '>= 2.0.0')) {
    const parseBuildEnv = requireFromApp('@quasar/app/lib/helpers/parse-build-env');

    chain.plugin('define')
      .use(webpack.DefinePlugin, [
        parseBuildEnv(cfg.build.env, cfg.__rootDefines),
      ]);
  } else {
    chain.plugin('define')
      .use(webpack.DefinePlugin, [cfg.build.env]);
  }

  // we include it already in cfg.build.env
  chain.optimization
    .nodeEnv(false);

  chain.performance
    .hints(false)
    .maxAssetSize(500000);

  if (cfg.build.showProgress) {
    chain.plugin('progress')
      .use(WebpackProgress, [{ name: configName }]);
  }

  return chain;
};
