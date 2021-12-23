#!/usr/bin/env node
/* eslint-disable no-void */
/* eslint-disable no-console */
/* eslint-disable global-require */

// eslint-disable-next-line no-void
if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'production';
}

if (process.env.STATIC === void 0) {
  process.env.STATIC = true;
}

const parseArgs = require('minimist');
const { redBright } = require('chalk');
const appRequire = require('../helpers/app-require');
const { fatal, warn } = require('../helpers/logger');
const ensureBuild = require('../build/ensureBuild');
const banner = require('../helpers/banner').generate;
const { hasNewQuasarConfFile } = require('../helpers/compatibility');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'debug',
    h: 'help',
  },
  boolean: ['h', 'd', 'force-build', 'fail-on-error'],
  default: {
    'force-build': false,
    'fail-on-error': false,
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

module.exports = async function run(api) {
  const QuasarConfFile = appRequire(hasNewQuasarConfFile(api) ? '@quasar/app/lib/quasar-conf-file' : '@quasar/app/lib/quasar-config', api.appDir);
  const getQuasarCtx = appRequire('@quasar/app/lib/helpers/get-quasar-ctx', api.appDir);
  const extensionRunner = appRequire('@quasar/app/lib/app-extension/extensions-runner', api.appDir);

  const ctx = getQuasarCtx({
    mode: 'ssr',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined,
  });

  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = await new QuasarConfFile(ctx);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    fatal('[FAIL] quasar.conf.js has JS errors');
  }

  await quasarConfFile.compile();

  await ensureBuild(api, quasarConfFile, ctx, extensionRunner, argv['force-build']);

  const quasarConf = hasNewQuasarConfFile(api)
    ? quasarConfFile.quasarConf : quasarConfFile.getBuildConfig();

  const { errors } = await require('../generate')(api, quasarConf, { failOnError: argv['fail-on-error'], debug: ctx.debug });

  if (argv['fail-on-error'] && errors.length > 0) {
    warn(redBright('[FAIL] Generating pages failed. Check log above.\n'));
    fatal(redBright('Exiting with non-zero code.'));
  }

  banner(quasarConf.ssg, errors);
};
