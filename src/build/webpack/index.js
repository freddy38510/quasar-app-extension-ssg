/* eslint-disable global-require */
const requireFromApp = require('../../helpers/require-from-app');
const { log } = require('../../helpers/logger');
const { webpackNames } = require('./symbols');

const createChain = requireFromApp('@quasar/app/lib/webpack/create-chain');

const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');

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

function getCSW(cfg) {
  const createCSW = require('./pwa/create-custom-sw');

  // csw - custom service worker
  return getWebpackConfig(createCSW(cfg, webpackNames.pwa.csw), cfg, {
    name: webpackNames.pwa.csw,
    cfgExtendBase: cfg.pwa,
    hookSuffix: 'PwaCustomSW',
    cmdSuffix: 'CustomSW',
    invokeParams: { isClient: true, isServer: false },
  });
}

async function getSSG(cfg) {
  const client = createChain(cfg, webpackNames.ssg.clientSide);

  if (cfg.ctx.mode.pwa) {
    requireFromApp('@quasar/app/lib/webpack/pwa')(client, cfg); // extending a PWA
  }

  require('./ssr/client')(client, cfg);

  const server = createChain(cfg, webpackNames.ssg.serverSide);
  require('./ssr/server')(server, cfg);

  const generator = require('./ssg/generator')(cfg, webpackNames.ssg.generator);

  return {
    ...(cfg.pwa.workboxPluginMode === 'InjectManifest' ? { csw: await getCSW(cfg) } : {}),

    generator: await getWebpackConfig(generator, cfg, {
      name: webpackNames.ssg.generator,
      cfgExtendBase: cfg.ssg,
      hookSuffix: 'Generator', // conf.ssg.chainWebpackGenerator
      cmdSuffix: 'Generator', // conf.ssg.extendWebpackGenerator
      invokeParams: { isClient: false, isServer: true },
    }),

    clientSide: await getWebpackConfig(client, cfg, {
      name: webpackNames.ssg.clientSide,
      invokeParams: { isClient: true, isServer: false },
    }),

    serverSide: await getWebpackConfig(server, cfg, {
      name: webpackNames.ssg.serverSide,
      invokeParams: { isClient: false, isServer: true },
    }),
  };
}

module.exports = async function createWebpackConf(cfg) {
  return getSSG(cfg);
};
