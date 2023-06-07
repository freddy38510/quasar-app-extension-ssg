const parseArgs = require('minimist');

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

argv.mode = 'ssg';

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

const appPaths = require('@quasar/app-webpack/lib/app-paths');
const { log, fatal } = require('../helpers/logger');
const { splitWebpackConfig } = require('../helpers/symbols');

const depth = parseInt(argv.depth, 10) || Infinity;

(async () => {
  require('@quasar/app-webpack/lib/helpers/banner')(argv, 'production');

  const QuasarConfFile = require('../quasar-config-file');
  const getQuasarCtx = require('../helpers/get-quasar-ctx');

  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    debug: argv.debug,
    dev: false,
    prod: true,
  });

  const extensionRunner = require('@quasar/app-webpack/lib/app-extension/extensions-runner');

  // remove ssg extension (otherwise the ext will be run again)
  extensionRunner.extensions.splice(
    extensionRunner.extensions
      .findIndex((extension) => extension.extId === 'ssg'),
    1,
  );

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx, argv);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    fatal(`${appPaths.quasarConfigFilename} has JS errors`, 'FAIL');
  }

  await quasarConfFile.compile();

  await quasarConfFile.addWebpackConf();

  const cfgEntries = splitWebpackConfig(quasarConfFile.webpackConf, 'ssg');

  if (argv.path) {
    const { getProperty } = await import('dot-prop');

    cfgEntries.forEach((entry) => {
      entry.webpack = getProperty(entry.webpack, argv.path);
    });
  }

  const { inspect } = require('util');

  cfgEntries.forEach((cfgEntry) => {
    console.log();
    log(`Showing Webpack config for "${cfgEntry.name}" with depth of ${depth}`);
    console.log();
    console.log(
      inspect(cfgEntry.webpack, {
        showHidden: true,
        depth,
        colors: argv.colors,
        compact: false,
      }),
    );
  });

  console.log(`\n  Depth used: ${depth}. You can change it with "-d" parameter.\n`);
})();
