/* eslint-disable no-void */
/*
 * Forked from vue-server-renderer/client-plugin.js v2.6.14 NPM package
 */

const requireFromApp = require('../helpers/require-from-app');
const getAssetName = require('../helpers/get-asset-name');

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
      .map((name) => stats.entrypoints[name].assets)
      .reduce((assets, all) => all.concat(assets), [])
      .map(getAssetName)
      .filter((file) => jsCssRE.test(file) === true && hotUpdateRE.test(file) === false),
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

  const { entrypoints, namedChunkGroups } = stats;

  const assetModules = stats.modules.filter((m) => m.assets.length);
  const fileToIndex = (asset) => manifest.all.indexOf(getAssetName(asset));

  stats.modules.forEach((m) => {
    // ignore modules duplicated in multiple chunks
    if (m.chunks.length === 1) {
      const cid = m.chunks[0];
      const chunk = stats.chunks.find((c) => c.id === cid);

      if (!chunk || !chunk.files) {
        return;
      }

      const id = m.identifier.replace(swRE, ''); // remove appended hash

      const filesSet = new Set(chunk.files.map(fileToIndex).filter((i) => i !== -1));

      chunk.names.forEach((chunkName) => {
        if (!entrypoints[chunkName]) {
          const chunkGroup = namedChunkGroups[chunkName];

          if (chunkGroup) {
            chunkGroup.assets.forEach((asset) => {
              filesSet.add(fileToIndex(asset));
            });

            chunkGroup.auxiliaryAssets.forEach((asset) => {
              filesSet.add(fileToIndex(asset));
            });
          }
        }
      });

      const files = Array.from(filesSet);
      manifest.modules[hash(id)] = files;

      // In production mode, modules may be concatenated by scope hoisting
      // Include ConcatenatedModule for not losing module-component mapping
      if (Array.isArray(m.modules)) {
        m.modules.forEach((concatenatedModule) => {
          const concatModuleId = hash(concatenatedModule.identifier.replace(swRE, ''));

          if (!manifest.modules[concatModuleId]) {
            manifest.modules[concatModuleId] = files;
          }
        });
      }

      // find all asset modules associated with the same chunk
      assetModules.forEach((assetModule) => {
        if (assetModule.chunks.includes(cid)) {
          // eslint-disable-next-line prefer-spread
          files.push.apply(files, assetModule.assets.map(fileToIndex));
        }
      });
    }
  });

  return manifest;
}

module.exports.QuasarSSRClientPlugin = class QuasarSSRClientPlugin {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    const { sources, Compilation } = requireFromApp('webpack');

    compiler.hooks.thisCompilation.tap('quasar-ssr-client-plugin', (compilation) => {
      if (compilation.compiler !== compiler) {
        // Ignore child compilers
        return;
      }

      compilation.hooks.processAssets.tapAsync(
        { name: 'quasar-ssr-client-plugin', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        (_, callback) => {
          const manifest = getClientManifest(compilation);
          const json = JSON.stringify(manifest, null, 2);
          const content = new sources.RawSource(json);

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
