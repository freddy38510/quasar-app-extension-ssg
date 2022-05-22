/* eslint-disable no-void */
/*
 * Forked from vue-server-renderer/client-plugin.js v2.6.14 NPM package
 */

const requireFromApp = require('../../../helpers/require-from-app');

const jsCssRE = /\.(js|css)(\?[^.]+)?$/;
const swRE = /\|\w+$/;
const hotUpdateRE = /\.hot-update\.js$/;

const uniq = (arr) => [...new Set(arr)];

function getClientManifest(compilation) {
  const hash = requireFromApp('hash-sum');

  const stats = compilation.getStats().toJson();

  const allFiles = uniq(
    stats.assets.map((a) => a.name).filter((file) => hotUpdateRE.test(file) === false),
  );

  const initialFiles = uniq(
    Object.keys(stats.entrypoints)
      .map((name) => stats.entrypoints[name].assets.map((asset) => asset.name))
      .reduce((assets, all) => all.concat(assets), [])
      .filter((file) => jsCssRE.test(file) === true && hotUpdateRE.test(file) === false)
      .concat(
        Object.keys(stats.entrypoints)
          .map((name) => stats.entrypoints[name].auxiliaryAssets.map((asset) => asset.name))
          .reduce((auxiliaryAssets, all) => all.concat(auxiliaryAssets), [])
          .filter((file) => hotUpdateRE.test(file) === false),
      ),
  );

  const asyncFiles = allFiles
    .filter((file) => jsCssRE.test(file))
    .filter((file) => initialFiles.includes(file) === false);

  const manifest = {
    publicPath: stats.publicPath,
    all: allFiles,
    initial: initialFiles,
    async: asyncFiles,
    modules: { /* [identifier: string]: Array<index: number> */ },
  };

  const assetModules = stats.modules.filter((m) => m.assets.length);
  const fileToIndex = (file) => manifest.all.indexOf(file);

  stats.modules.forEach((m) => {
    // ignore modules duplicated in multiple chunks
    if (m.chunks.length === 1) {
      const cid = m.chunks[0];
      const chunk = stats.chunks.find((c) => c.id === cid);

      if (!chunk || !chunk.files) {
        return;
      }

      const id = m.identifier.replace(swRE, ''); // remove appended hash
      // eslint-disable-next-line no-multi-assign
      const files = manifest.modules[hash(id)] = chunk.files.map(fileToIndex);

      // find all asset modules associated with the same chunk
      assetModules.forEach((assetModule) => {
        if (assetModule.chunks.includes(cid)) {
          files.push(...assetModule.assets.map(fileToIndex));
        }
      });
    }
  });

  return manifest;
}

module.exports.getClientManifest = getClientManifest;

module.exports.QuasarSSRClientPlugin = class QuasarSSRClientPlugin {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    const { sources } = requireFromApp('webpack');

    compiler.hooks.thisCompilation.tap('quasar-ssr-client-plugin', (compilation) => {
      if (compilation.compiler !== compiler) {
        // Ignore child compilers
        return;
      }

      compilation.hooks.afterProcessAssets.tap(
        'quasar-ssr-client-plugin',
        () => {
          const manifest = getClientManifest(compilation);

          if (!manifest) {
            return;
          }

          const json = JSON.stringify(manifest, null, 2);
          const content = new sources.RawSource(json);

          if (compilation.getAsset(this.cfg.filename) !== void 0) {
            compilation.updateAsset(this.cfg.filename, content);
          } else {
            compilation.emitAsset(this.cfg.filename, content);
          }
        },
      );
    });
  }
};
