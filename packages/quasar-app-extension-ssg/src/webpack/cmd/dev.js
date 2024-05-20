/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */

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
    Starts the app in development mode (live reloading, error
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

const ensureVueDeps = require('@quasar/app-webpack/lib/helpers/ensure-vue-deps');
const { displayBuildBanner } = require('../helpers/banner');
const { log, fatal } = require('../helpers/logger');

ensureVueDeps();
displayBuildBanner(argv, 'dev');

async function startVueDevtools(devtoolsPort) {
  const { spawn } = require('@quasar/app-webpack/lib/helpers/spawn');
  const getPackagePath = require('@quasar/app-webpack/lib/helpers/get-package-path');

  let vueDevtoolsBin = getPackagePath('@vue/devtools/bin.js');

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

  const nodePackager = require('@quasar/app-webpack/lib/helpers/node-packager');

  nodePackager.installPackage('@vue/devtools', { isDev: true, isDevDependency: true });

  // a small delay is a must, otherwise require.resolve
  // after a yarn/npm install will fail
  return new Promise((resolve) => {
    vueDevtoolsBin = getPackagePath('@vue/devtools/bin.js');
    run().then(resolve);
  });
}

(async () => {
  const extensionRunner = require('@quasar/app-webpack/lib/app-extension/extensions-runner');
  const DevServer = require('../dev-server-ssg');
  const QuasarConfFile = require('../quasar-config-file');
  const EntryFilesGenerator = require('../EntryFilesGenerator');
  const getQuasarCtx = require('../helpers/get-quasar-ctx');
  const regenerateTypesFeatureFlags = require('../helpers/types-feature-flags');

  const ctx = getQuasarCtx({
    mode: 'ssg',
    dev: true,
    vueDevtools: argv.devtools,
  });

  // remove ssg extension (otherwise the ext will be run again)
  extensionRunner.extensions.splice(
    extensionRunner.extensions
      .findIndex((extension) => extension.extId === 'ssg'),
    1,
  );

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx, {
    port: argv.port,
    host: argv.hostname,
    verifyAddress: true,
    onBuildChange() {
      log('Rebuilding app...');
      dev = dev.then(startDev);
    },
    onAppChange() {
      log('Updating app...');
      generator.build();
    },
  });

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    fatal('quasar.config.js has JS errors', 'FAIL');
  }

  await quasarConfFile.compile();

  await quasarConfFile.addWebpackConf();

  const { quasarConf } = quasarConfFile;

  regenerateTypesFeatureFlags(quasarConf);

  if (quasarConf.__vueDevtools !== false) {
    await startVueDevtools(quasarConf.__vueDevtools.port);
  }

  if (typeof quasarConf.build.beforeDev === 'function') {
    await quasarConf.build.beforeDev({ quasarConf });
  }

  // run possible beforeDev hooks
  await extensionRunner.runHook('beforeDev', async (hook) => {
    log(`Extension(${hook.api.extId}): Running beforeDev hook...`);
    await hook.fn(hook.api, { quasarConf });
  });

  const generator = new EntryFilesGenerator(quasarConfFile);

  const PwaRunner = require('@quasar/app-webpack/lib/pwa');
  const runPwa = () => PwaRunner.run(quasarConfFile);

  function startDev(oldDevServer) {
    let devServer;

    const runMain = async () => {
      if (oldDevServer !== void 0) {
        await oldDevServer.stop();
        oldDevServer = void 0;
      }

      generator.build(); // Update generated files
      devServer = new DevServer(quasarConfFile); // Create new devserver

      return devServer.listen(); // Start listening
    };

    let promise = Promise.resolve();

    // using quasarConfFile.ctx instead of argv.mode
    // because SSR might also have PWA enabled but we
    // can only know it after parsing the quasar.config.js file
    promise = quasarConfFile.ctx.mode.pwa === true
      ? promise.then(runPwa).then(runMain)
      : promise.then(runMain).then(runPwa);

    return promise.then(() => devServer); // Pass new builder to watch chain
  }

  let dev = startDev().then(async (payload) => {
    if (typeof quasarConf.build.afterDev === 'function') {
      await quasarConf.build.afterDev({ quasarConf });
    }

    // run possible afterDev hooks
    await extensionRunner.runHook('afterDev', async (hook) => {
      log(`Extension(${hook.api.extId}): Running afterDev hook...`);
      await hook.fn(hook.api, { quasarConf });
    });

    return payload;
  });
})();
