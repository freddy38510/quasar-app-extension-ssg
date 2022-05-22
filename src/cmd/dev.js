/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable global-require */
/* eslint-disable no-console */
/* eslint-disable no-void */

if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'development';
}

const requireFromApp = require('../helpers/require-from-app');
const { log, warn, fatal } = require('../helpers/logger');

const parseArgs = requireFromApp('minimist');

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
    --hostname, -H   A hostname to use for serving the application
    --help, -h       Displays this message

    --devtools, -d   Open remote Vue Devtools
  `);
  process.exit(0);
}

const ensureVueDeps = requireFromApp('@quasar/app/lib/helpers/ensure-vue-deps');

ensureVueDeps();

const banner = require('../helpers/banner').logBuildBanner;

banner(argv, 'dev');

const findPort = requireFromApp('@quasar/app/lib/helpers/net').findClosestOpenPort;

async function parseAddress({ host, port }) {
  try {
    const openPort = await findPort(port, host);
    if (port !== openPort) {
      warn();
      warn(`️️Setting port to closest one available: ${openPort}`);
      warn();

      port = openPort;
    }
  } catch (e) {
    warn();

    if (e.message === 'ERROR_NETWORK_PORT_NOT_AVAIL') {
      warn('Could not find an open port. Please configure a lower one to start searching with.');
    } else if (e.message === 'ERROR_NETWORK_ADDRESS_NOT_AVAIL') {
      warn('Invalid host specified. No network address matches. Please specify another one.');
    } else {
      warn('Unknown network error occurred');
      console.log(e);
    }

    warn();

    if (!this.running) {
      process.exit(1);
    }

    return null;
  }

  this.running = true;
  return { host, port };
}

function startVueDevtools() {
  const { spawn } = requireFromApp('@quasar/app/lib/helpers/spawn');
  const getPackagePath = requireFromApp('@quasar/app/lib/helpers/get-package-path');

  let vueDevtoolsBin = getPackagePath('@vue/devtools/bin.js');

  function run() {
    log('Booting up remote Vue Devtools...');
    spawn(vueDevtoolsBin, [], {});
  }

  if (vueDevtoolsBin !== void 0) {
    run();
    return undefined;
  }

  const nodePackager = requireFromApp('@quasar/app/lib/helpers/node-packager');

  nodePackager.installPackage('@vue/devtools', { isDev: true });

  // a small delay is a must, otherwise require.resolve
  // after a yarn/npm install will fail
  return new Promise((resolve) => {
    vueDevtoolsBin = getPackagePath('@vue/devtools/bin.js');
    run();
    resolve();
  });
}

async function goLive() {
  const installMissing = requireFromApp('@quasar/app/lib/mode/install-missing');
  await installMissing('ssr');

  const DevServer = require('../dev/dev-server-ssg');
  const QuasarConfFile = require('../conf');
  const Generator = require('../build/generator');
  const getQuasarCtx = require('../helpers/get-quasar-ctx');
  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');
  const regenerateTypesFeatureFlags = requireFromApp('@quasar/app/lib/helpers/types-feature-flags');

  const ctx = getQuasarCtx({
    mode: 'ssg',
    dev: true,
    vueDevtools: argv.devtools,
  });

  // do not run ssg extension again
  // TODO: extend ExtensionRunner class
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
    onAddress: parseAddress,
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
    await startVueDevtools();
  }

  if (typeof quasarConf.build.beforeDev === 'function') {
    await quasarConf.build.beforeDev({ quasarConf });
  }

  // run possible beforeDev hooks
  await extensionRunner.runHook('beforeDev', async (hook) => {
    log(`Extension(${hook.api.extId}): Running beforeDev hook...`);
    await hook.fn(hook.api, { quasarConf });
  });

  const generator = new Generator(quasarConfFile);

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
    if (quasarConfFile.quasarConf.ctx.mode.pwa === true) {
      const PwaRunner = requireFromApp('@quasar/app/lib/pwa');
      const runPwa = () => PwaRunner.run(quasarConfFile);

      promise = promise.then(runPwa).then(runMain);
    } else {
      promise = promise.then(runMain);
    }

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
}

goLive();
