if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'development';
}

const parseArgs = require('minimist');

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
    --devtools, -d   Open remote Vue Devtools
    --hostname, -H   A hostname to use for serving the application
    --help, -h       Displays this message
  `);
  process.exit(0);
}

const { log, fatal } = require('../helpers/logger');

async function startVueDevtools(devtoolsPort) {
  const { spawn } = require('@quasar/app-vite/lib/helpers/spawn');
  const getPackagePath = require('@quasar/app-vite/lib/helpers/get-package-path');

  let vueDevtoolsBin = getPackagePath('.bin/vue-devtools');

  function run() {
    log('Booting up remote Vue Devtools...');
    spawn(vueDevtoolsBin, [], {
      env: {
        ...process.env,
        PORT: devtoolsPort,
      },
    });

    log('Waiting for remote Vue Devtools to initialize...');
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  if (vueDevtoolsBin !== void 0) {
    await run();
    return undefined;
  }

  const nodePackager = require('@quasar/app-vite/lib/helpers/node-packager');

  nodePackager.installPackage('@vue/devtools', { isDevDependency: true, isDev: true });

  // a small delay is a must, otherwise require.resolve
  // after a yarn/npm install will fail
  return new Promise((resolve) => {
    vueDevtoolsBin = getPackagePath('.bin/vue-devtools');
    run().then(resolve);
  });
}

(async () => {
  const getQuasarCtx = require('../helpers/get-quasar-ctx');
  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    emulator: undefined,
    dev: true,
    vueDevtools: argv.devtools,
  });

  // register app extensions
  const extensionRunner = require('@quasar/app-vite/lib/app-extension/extensions-runner');
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
    verifyAddress: true,
  });

  const quasarConf = await quasarConfFile.read();
  if (quasarConf.error !== void 0) {
    fatal(quasarConf.error, 'FAIL');
  }

  const regenerateTypesFeatureFlags = require('../helpers/types-feature-flags');
  regenerateTypesFeatureFlags(quasarConf);

  if (quasarConf.metaConf.vueDevtools !== false) {
    await startVueDevtools(quasarConf.metaConf.vueDevtools.port);
  }

  const AppDevServer = require('../ssg-devserver');
  const devServer = new AppDevServer({ argv });

  if (typeof quasarConf.build.beforeDev === 'function') {
    await quasarConf.build.beforeDev({ quasarConf });
  }

  // run possible beforeDev hooks
  await extensionRunner.runHook('beforeDev', async (hook) => {
    log(`Extension(${hook.api.extId}): Running beforeDev hook...`);
    await hook.fn(hook.api, { quasarConf });
  });

  await devServer.run(quasarConf);

  if (typeof quasarConf.build.afterDev === 'function') {
    await quasarConf.build.afterDev({ quasarConf });
  }
  // run possible afterDev hooks
  await extensionRunner.runHook('afterDev', async (hook) => {
    log(`Extension(${hook.api.extId}): Running afterDev hook...`);
    await hook.fn(hook.api, { quasarConf });
  });

  quasarConfFile.watch((_quasarConf) => {
    devServer.run(_quasarConf);
  });
})();
