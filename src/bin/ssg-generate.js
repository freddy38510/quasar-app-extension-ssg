#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable global-require */

// eslint-disable-next-line no-void
if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'production';
}
const parseArgs = require('minimist');
const appRequire = require('../helpers/app-require');
const { fatal } = require('../helpers/logger');
const ensureBuild = require('../build/ensureBuild');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'debug',
    h: 'help',
  },
  boolean: ['h', 'd', 'force-build'],
  default: {
    'force-build': false,
  },
});

if (argv.help) {
  console.log(` Description
   Generate static site of your app.
 Usage
   $ quasar ssg generate
 Options
   --force-build   Force to build the application with webpack
   --debug, -d     Build for debugging purposes

   --help, -h      Displays this message
  `);
  process.exit(0);
}

module.exports = async function run(api) {
  const QuasarConfFile = appRequire('@quasar/app/lib/quasar-conf-file', api.appDir);
  const getQuasarCtx = appRequire('@quasar/app/lib/helpers/get-quasar-ctx', api.appDir);
  const extensionRunner = appRequire('@quasar/app/lib/app-extension/extensions-runner', api.appDir);

  const installMissing = appRequire(
    '@quasar/app/lib/mode/install-missing',
    api.appDir,
  );

  const ctx = getQuasarCtx({
    mode: 'ssr',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined,
  });

  await installMissing(ctx.modeName, ctx.targetName);

  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx, argv);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.error(e);
    fatal('quasar.conf.js has JS errors', 'FAIL');
  }

  await quasarConfFile.compile();

  await ensureBuild(api, quasarConfFile, ctx, extensionRunner, argv['force-build']);

  const { quasarConf } = quasarConfFile;

  await require('../generate')(api, quasarConf, ctx);
};
