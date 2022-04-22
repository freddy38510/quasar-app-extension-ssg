#!/usr/bin/env node
/* eslint-disable no-void */
/* eslint-disable no-console */
/* eslint-disable global-require */

if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'production';
}

if (process.env.STATIC === void 0) {
  process.env.STATIC = true;
}

const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'debug',
    h: 'help',
  },
  boolean: ['h', 'd', 'force-build', 'fail-on-error'],
  default: {
    'force-build': false,
    'fail-on-error': true,
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
   --fail-on-error Exit with non-zero status code if there are errors when generating pages

   --help, -h      Displays this message
  `);
  process.exit(0);
}

const requireFromApp = require('../helpers/require-from-app');
const { fatal } = require('../helpers/logger');
const ensureBuild = require('../helpers/ensure-build');
const banner = require('../helpers/banner');
const { hasNewQuasarConfFile } = require('../helpers/compatibility');
const getQuasarCtx = require('../helpers/get-quasar-ctx');

async function run() {
  const QuasarConfFile = requireFromApp(hasNewQuasarConfFile ? '@quasar/app/lib/quasar-conf-file' : '@quasar/app/lib/quasar-config');
  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');
  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    failOnError: argv['fail-on-error'],
    prod: true,
    publish: undefined,
  });

  banner.build(ctx);

  const installMissing = requireFromApp('@quasar/app/lib/mode/install-missing');
  await installMissing('ssr');

  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = await new QuasarConfFile(ctx, argv);
  quasarConfFile.webpackConfChanged = false;

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    fatal('[FAIL] quasar.conf.js has JS errors');
  }

  await quasarConfFile.compile();

  await ensureBuild(quasarConfFile);

  const quasarConf = hasNewQuasarConfFile
    ? quasarConfFile.quasarConf : quasarConfFile.getBuildConfig();

  await require('../generate')(quasarConf);
}

run();
