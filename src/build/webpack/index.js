/* eslint-disable global-require */
const requireFromApp = require('../../helpers/require-from-app');
const { log } = require('../../helpers/logger');

const createChain = requireFromApp('@quasar/app/lib/webpack/create-chain');
const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');

async function getWebpackConfig(chain, cfg, {
  name,
  hot,
  cfgExtendBase = cfg.build,
  hookSuffix = '',
  invokeParams,
}) {
  await extensionRunner.runHook(`chainWebpack${hookSuffix}`, async (hook) => {
    log(`Extension(${hook.api.extId}): Chaining ${name ? `${name} ` : ''}Webpack config`);
    await hook.fn(chain, invokeParams, hook.api);
  });

  if (typeof cfgExtendBase.chainWebpack === 'function') {
    log(`Chaining ${name ? `${name} ` : ''}Webpack config`);
    await cfgExtendBase.chainWebpack(chain, invokeParams);
  }

  const webpackConfig = chain.toConfig();

  await extensionRunner.runHook(`extendWebpack${hookSuffix}`, async (hook) => {
    log(`Extension(${hook.api.extId}): Extending ${name ? `${name} ` : ''}Webpack config`);
    await hook.fn(webpackConfig, invokeParams, hook.api);
  });

  if (typeof cfgExtendBase.extendWebpack === 'function') {
    log(`Extending ${name ? `${name} ` : ''}Webpack config`);
    await cfgExtendBase.extendWebpack(webpackConfig, invokeParams);
  }

  if (hot && cfg.ctx.dev && cfg.devServer.hot) {
    // tap entries for HMR
    require('webpack-dev-server').addDevServerEntrypoints(webpackConfig, cfg.devServer);
  }

  return webpackConfig;
}

function getCSW(cfg) {
  const createCSW = require('./pwa/create-custom-sw');

  // csw - custom service worker
  return getWebpackConfig(createCSW(cfg, 'Custom Service Worker'), cfg, {
    name: 'Custom Service Worker',
    cfgExtendBase: cfg.pwa,
    hookSuffix: 'PwaCustomSW',
    invokeParams: { isClient: true, isServer: false },
  });
}

async function getSSG(cfg) {
  const client = createChain(cfg, 'Client');

  if (cfg.ctx.mode.pwa) {
    require('./pwa')(client, cfg); // extending a PWA
  }

  require('./ssr/client')(client, cfg);

  const server = createChain(cfg, 'Server');
  require('./ssr/server')(server, cfg);

  const generator = require('./ssg/generator')(cfg, 'Generator');

  return {
    ...(cfg.pwa.workboxPluginMode === 'InjectManifest' ? { csw: await getCSW(cfg) } : {}),

    generator: await getWebpackConfig(generator, cfg, {
      name: 'Generator',
      cfgExtendBase: cfg.ssg,
      // not supported yet without adding ssg hooks to Index API
      hookSuffix: 'SsgGenerator',
      invokeParams: { isClient: false, isServer: true },
    }),

    client: await getWebpackConfig(client, cfg, {
      name: 'Client',
      invokeParams: { isClient: true, isServer: false },
    }),

    server: await getWebpackConfig(server, cfg, {
      name: 'Server',
      invokeParams: { isClient: false, isServer: true },
    }),
  };
}

module.exports = async function createWebpackConf(cfg) {
  return getSSG(cfg);
};
