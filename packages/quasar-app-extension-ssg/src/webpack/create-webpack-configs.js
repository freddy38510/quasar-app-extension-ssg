const { join, dirname } = require('path');
const extensionRunner = require('@quasar/app-webpack/lib/app-extension/extensions-runner');
const { log } = require('./helpers/logger');
const { webpackNames } = require('./helpers/symbols');

async function getWebpackConfig(chain, cfg, {
  name,
  cfgExtendBase = cfg.build,
  hookSuffix = '',
  cmdSuffix = '',
  invokeParams,
}) {
  await extensionRunner.runHook(`chainWebpack${hookSuffix}`, async (hook) => {
    log(`Extension(${hook.api.extId}): Chaining "${name}" Webpack config`);
    await hook.fn(chain, invokeParams, hook.api);
  });

  if (typeof cfgExtendBase[`chainWebpack${cmdSuffix}`] === 'function') {
    log(`Chaining "${name}" Webpack config`);
    await cfgExtendBase[`chainWebpack${cmdSuffix}`](chain, invokeParams);
  }

  // webpack loaders from @quasar/app-webpack are not resolved properly (via require.resolve)
  chain.resolveLoader.modules
    .merge([
      // add node_modules folder containing @quasar/app-webpack package
      join(dirname(require.resolve('@quasar/app-webpack/package.json')), '../..'),
    ]);

  const webpackConfig = chain.toConfig();

  await extensionRunner.runHook(`extendWebpack${hookSuffix}`, async (hook) => {
    log(`Extension(${hook.api.extId}): Extending "${name}" Webpack config`);
    await hook.fn(webpackConfig, invokeParams, hook.api);
  });

  if (typeof cfgExtendBase[`extendWebpack${cmdSuffix}`] === 'function') {
    log(`Extending "${name}" Webpack config`);
    await cfgExtendBase[`extendWebpack${cmdSuffix}`](webpackConfig, invokeParams);
  }

  if (cfg.ctx.dev) {
    webpackConfig.optimization = webpackConfig.optimization || {};
    webpackConfig.optimization.emitOnErrors = false;

    webpackConfig.infrastructureLogging = {
      colors: true,
      level: 'warn',
      ...webpackConfig.infrastructureLogging,
    };
  }

  return webpackConfig;
}

async function getCSW(cfg) {
  const cswChain = require('./chains/csw')(cfg, webpackNames.pwa.csw);

  // csw - custom service worker
  return getWebpackConfig(cswChain, cfg, {
    name: webpackNames.pwa.csw,
    cfgExtendBase: cfg.pwa,
    hookSuffix: 'PwaCustomSW',
    cmdSuffix: 'CustomSW',
    invokeParams: { isClient: true, isServer: false },
  });
}

module.exports = async function createWebpackConf(cfg) {
  const rendererChain = require('./chains/renderer')(cfg, webpackNames.ssg.renderer);

  const serverChain = require('./chains/server')(cfg, webpackNames.ssg.serverSide);

  const clientChain = require('./chains/client')(cfg, webpackNames.ssg.clientSide);

  if (cfg.ctx.mode.pwa) {
    require('./chains/pwa')(clientChain, cfg); // extending a PWA
  }

  return {
    ...(cfg.ctx.mode.pwa && cfg.pwa.workboxPluginMode === 'InjectManifest' ? { csw: await getCSW(cfg) } : {}),

    renderer: await getWebpackConfig(rendererChain, cfg, {
      name: webpackNames.ssg.renderer,
      cfgExtendBase: cfg.ssg,
      // not supported yet without adding ssg hooks to Index API
      hookSuffix: 'SSGRenderer',
      // supported (but not documented)
      // quasarConf.ssg.chainWebpackRenderer / quasarConf.ssg.extendWebpackRenderer
      cmdSuffix: 'Renderer',
      invokeParams: { isClient: false, isServer: true },
    }),

    clientSide: await getWebpackConfig(clientChain, cfg, {
      name: webpackNames.ssg.clientSide,
      invokeParams: { isClient: true, isServer: false },
    }),

    serverSide: await getWebpackConfig(serverChain, cfg, {
      name: webpackNames.ssg.serverSide,
      invokeParams: { isClient: false, isServer: true },
    }),
  };
};
