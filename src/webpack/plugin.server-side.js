/* eslint-disable no-console */
/*
 * Forked from vue-server-renderer/server-plugin.js v2.6.14 NPM package
 */

const requireFromApp = require('../helpers/require-from-app');
const getAssetName = require('../helpers/get-asset-name');

const jsRE = /\.js(\?[^.]+)?$/;
const jsMapRE = /\.js\.map$/;
const mapRE = /\.map$/;

const banner = 'quasar-app-extension-ssg/src/webpack/webpack-server-plugin';

function warn(msg) {
  console.warn(msg ? ` [warn] ${banner} ⚠️  ${msg}` : '');
}

function error(msg) {
  console.error(msg ? ` [error] ${banner} ⚠️  ${msg}` : '');
}

function getServerManifest(compilation) {
  const stats = compilation.getStats().toJson();
  const entryName = Object.keys(stats.entrypoints)[0];
  const entryInfo = stats.entrypoints[entryName];

  if (!entryInfo) {
    // https://github.com/vuejs/vue/issues/5553
    return false;
  }

  const entryAssets = entryInfo.assets
    .map(getAssetName)
    .filter((file) => jsRE.test(file));

  if (entryAssets.length > 1) {
    throw new Error(
      'Server-side bundle should have one single entry file. '
      + 'Avoid using CommonsChunkPlugin in the server config.',
    );
  }

  const entry = entryAssets[0];
  if (!entry || typeof entry !== 'string') {
    throw new Error(
      (`Entry "${entryName}" not found. Did you specify the correct entry option?`),
    );
  }

  const serverManifest = {
    entry,
    files: {},
    maps: {},
  };

  Object.keys(compilation.assets)
    .filter((name) => name !== '../render-template.js')
    .forEach((name) => {
      if (jsRE.test(name)) {
        serverManifest.files[name] = compilation.getAsset(name).source.source();
      } else if (name.match(jsMapRE)) {
        serverManifest.maps[name.replace(mapRE, '')] = JSON.parse(
          compilation.getAsset(name).source.source(),
        );
      }

      // do not emit anything else for server
      compilation.deleteAsset(name);
    });

  return serverManifest;
}

module.exports.getServerManifest = getServerManifest;

module.exports.QuasarSSRServerPlugin = class QuasarSSRServerPlugin {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    if (compiler.options.target !== 'node') {
      error('webpack config `target` should be "node".');
    }

    if (compiler.options.output && compiler.options.output.library && compiler.options.output.library.type !== 'commonjs2') {
      error('webpack config `output.library.type` should be "commonjs2".');
    }

    if (!compiler.options.externals) {
      warn(
        'It is recommended to externalize dependencies in the server build for '
        + 'better build performance.',
      );
    }

    const { sources, Compilation } = requireFromApp('webpack');

    compiler.hooks.thisCompilation.tap('quasar-ssr-server-plugin', (compilation) => {
      if (compilation.compiler !== compiler) {
        // Ignore child compilers
        return;
      }

      compilation.hooks.processAssets.tapAsync(
        { name: 'quasar-ssr-server-plugin', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        (_, callback) => {
          const serverManifest = getServerManifest(compilation);

          if (!serverManifest) {
            callback();
          }

          const json = JSON.stringify(serverManifest, null, 2);
          const content = new sources.RawSource(json);

          // eslint-disable-next-line no-void
          if (compilation.getAsset(this.cfg.filename) !== void 0) {
            compilation.updateAsset(this.cfg.filename, content);
          } else {
            compilation.emitAsset(this.cfg.filename, content);
          }

          callback();
        },
      );
    });
  }
};
