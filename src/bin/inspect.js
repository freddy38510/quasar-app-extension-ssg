#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable global-require */

const parseArgs = require('minimist');
const requireFromApp = require('../helpers/require-from-app');
const { log, fatal } = require('../helpers/logger');
const { hasNewQuasarConfFile } = require('../helpers/compatibility');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'depth',
    p: 'path',
    h: 'help',
  },
  boolean: ['h', 'colors'],
  string: ['p'],
  default: {
    d: 5,
    colors: true,
  },
});

argv.mode = 'ssr';

if (argv.help) {
  console.log(`
  Description
    Inspect Quasar generated Webpack config

  Usage
    $ quasar ssg inspect
    $ quasar ssg inspect -p 'module.rules'

  Options
    --depth, -d      Number of levels deep (default: 5)
    --path, -p       Path of config in dot notation
                        Examples:
                          -p module.rules
                          -p plugins
    --colors,        Style output with ANSI color codes
    --help, -h       Displays this message
  `);
  process.exit(0);
}

function getCfgEntries(webpackConf) {
  return [
    { name: 'Server', webpackCfg: webpackConf.server },
    { name: 'Client', webpackCfg: webpackConf.client },
  ];
}

async function inspect() {
  requireFromApp('@quasar/app/lib/helpers/banner')(argv, 'production');

  const getMode = requireFromApp('@quasar/app/lib/mode/index');
  if (getMode('ssr').isInstalled !== true) {
    fatal('Requested mode for inspection is NOT installed.\n');
  }

  const QuasarConfFile = requireFromApp(hasNewQuasarConfFile ? '@quasar/app/lib/quasar-conf-file' : '@quasar/app/lib/quasar-config');

  const depth = parseInt(argv.depth, 10) || Infinity;

  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');
  const getQuasarCtx = requireFromApp('@quasar/app/lib/helpers/get-quasar-ctx');

  const ctx = getQuasarCtx({
    mode: 'ssr',
    target: undefined,
    debug: argv.debug,
    dev: false,
    prod: true,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    fatal('[FAIL] quasar.conf.js has JS errors');
  }

  await quasarConfFile.compile();

  const util = require('util');

  let cfgEntries = getCfgEntries(
    hasNewQuasarConfFile
      ? quasarConfFile.webpackConf
      : quasarConfFile.getWebpackConfig(),
  );

  if (argv.path) {
    const dot = require('dot-prop');
    cfgEntries = cfgEntries.map((cfgEntry) => ({
      name: cfgEntry.name,
      webpackCfg: dot.get(cfgEntry.webpackCfg, argv.path),
    }));
  }

  cfgEntries.forEach((cfgEntry) => {
    console.log();
    log(`Showing Webpack config "${cfgEntry.name}" with depth of ${depth}`);
    console.log();
    console.log(
      util.inspect(cfgEntry.webpackCfg, {
        showHidden: true,
        depth,
        colors: argv.colors,
        compact: false,
      }),
    );
  });

  console.log(`\n  Depth used: ${depth}. You can change it with "-d" parameter.\n`);
}

inspect();
