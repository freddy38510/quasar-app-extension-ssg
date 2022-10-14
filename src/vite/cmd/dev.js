/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-void */
if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'development';
}

const parseArgs = require('minimist');

const { log, fatal } = require('../helpers/logger');
const { requireFromApp } = require('../helpers/packages');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    p: 'port',
    H: 'hostname',
    h: 'help',
    d: 'devtools',
  },
  boolean: ['h', 'd'],
  string: ['H'],
});

if (argv.help) {
  console.log(`
  Description
    Starts the app in development mode (hot-code reloading, error
    reporting, etc)

  Usage
    $ quasar ssg dev
    $ quasar ssg dev -p <port number>

  Options
    --port, -p       A port number on which to start the application
    --hostname, -H   A hostname to use for serving the application
    --help, -h       Displays this message
    --devtools, -d   Open remote Vue Devtools
  `);
  process.exit(0);
}

function startVueDevtools() {
  const { spawn } = requireFromApp('@quasar/app-vite/lib/helpers/spawn');

  let vueDevtoolsBin = requireFromApp('@vue/devtools/bin.js');

  function run() {
    log('Booting up remote Vue Devtools...');
    spawn(vueDevtoolsBin, [], {});
  }

  if (vueDevtoolsBin !== void 0) {
    run();
    return undefined;
  }

  const nodePackager = requireFromApp('@quasar/app-vite/lib/helpers/node-packager');

  nodePackager.installPackage('@vue/devtools', { isDev: true });

  // a small delay is a must, otherwise require.resolve
  // after a yarn/npm install will fail
  return new Promise((resolve) => {
    vueDevtoolsBin = requireFromApp('@vue/devtools/bin.js');
    run();
    resolve();
  });
}

async function goLive() {
  // install ssr mode if it's missing
  const { add } = requireFromApp('@quasar/app-vite/lib/modes/ssr/ssr-installation');
  await add(true);

  const getQuasarCtx = require('../helpers/get-quasar-ctx');
  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    emulator: undefined,
    dev: true,
    vueDevtools: argv.devtools,
  });

  // register app extensions
  const extensionRunner = requireFromApp('@quasar/app-vite/lib/app-extension/extensions-runner');
  extensionRunner.extensions.splice(
    extensionRunner.extensions
      .findIndex((extension) => extension.extId === 'ssg'),
    1,
  );
  await extensionRunner.registerExtensions(ctx);

  const QuasarConfFile = require('../quasar-config-file');
  const quasarConfFile = new QuasarConfFile({
    ctx,
    port: argv.port,
    host: argv.hostname,
  });

  const quasarConf = await quasarConfFile.read();
  if (quasarConf.error !== void 0) {
    fatal(quasarConf.error, 'FAIL');
  }

  const regenerateTypesFeatureFlags = requireFromApp('@quasar/app-vite/lib/helpers/types-feature-flags');
  regenerateTypesFeatureFlags(quasarConf);

  if (quasarConf.metaConf.vueDevtools !== false) {
    await startVueDevtools();
  }

  const AppDevServer = require('../ssg-devserver');
  const devServer = new AppDevServer({ argv, ctx });

  if (typeof quasarConf.build.beforeDev === 'function') {
    await quasarConf.build.beforeDev({ quasarConf });
  }

  // run possible beforeDev hooks
  await extensionRunner.runHook('beforeDev', async (hook) => {
    log(`Extension(${hook.api.extId}): Running beforeDev hook...`);
    await hook.fn(hook.api, { quasarConf });
  });

  devServer.run(quasarConf)
    .then(async () => {
      if (typeof quasarConf.build.afterDev === 'function') {
        await quasarConf.build.afterDev({ quasarConf });
      }
      // run possible afterDev hooks
      await extensionRunner.runHook('afterDev', async (hook) => {
        log(`Extension(${hook.api.extId}): Running afterDev hook...`);
        await hook.fn(hook.api, { quasarConf });
      });
    });

  quasarConfFile.watch((_quasarConf) => {
    devServer.run(_quasarConf);
  });
}

goLive();
