/* eslint-disable no-console */
/* eslint-disable no-void */
/* eslint-disable global-require */
const { requireFromApp } = require('../helpers/packages');

const parseArgs = requireFromApp('minimist');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    c: 'cmd',

    d: 'depth',
    p: 'path',

    t: 'thread',

    h: 'help',
  },
  boolean: ['h', 'colors'],
  string: ['c', 'p', 't'],
  default: {
    c: 'dev',
    d: 2,
    colors: true,
  },
});

if (argv.help) {
  console.log(`
  Description
    Inspect Quasar generated Vite config

  Usage
    $ quasar ssg inspect
    $ quasar ssg inspect -c generate
    $ quasar ssg inspect -p 'build.outDir'

  Options
    --cmd, -c        Quasar command [dev|generate] (default: dev)
    --depth, -d      Number of levels deep (default: 2)
    --path, -p       Path of config in dot notation
                        Examples:
                          -p module.rules
                          -p plugins
    --thread, -t     Display only one specific app mode config thread
    --colors,        Style output with ANSI color codes (default: true)
    --help, -h       Displays this message
  `);
  process.exit(0);
}

argv.mode = 'ssg';

require('../helpers/banner-global')(argv, argv.cmd);

const { log, fatal } = require('../helpers/logger');

const depth = parseInt(argv.depth, 10) || Infinity;

async function inspect() {
  const getQuasarCtx = require('../helpers/get-quasar-ctx');
  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    debug: argv.debug,
    dev: argv.cmd === 'dev',
    prod: argv.cmd === 'generate',
  });

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

  const generateConfig = require('../ssg-config');

  const cfgEntries = [];
  let threadList = Object.keys(generateConfig);

  if (argv.thread) {
    if (threadList.includes(argv.thread) === false) {
      fatal('Requested thread for inspection is NOT available for selected mode.');
    }

    threadList = [argv.thread];
  }

  await Promise.all(threadList.map(async (name) => {
    cfgEntries.push({
      name,
      object: await generateConfig[name](quasarConf),
    });
  }));

  if (argv.path) {
    const dot = requireFromApp('dot-prop');
    cfgEntries.forEach((cfgEntry) => {
      cfgEntry.object = dot.get(cfgEntry.object, argv.path);
    });
  }

  const util = require('util');

  cfgEntries.forEach((cfgEntry) => {
    const tool = cfgEntry.object.configFile !== void 0
      ? 'Vite'
      : 'esbuild';

    console.log();
    log(`Showing "${cfgEntry.name}" config (for ${tool}) with depth of ${depth}`);
    console.log();
    console.log(
      util.inspect(cfgEntry.object, {
        showHidden: true,
        depth,
        colors: argv.colors,
        compact: false,
      }),
    );
  });

  console.log(`\n  Depth used: ${depth}. You can change it with "-d" / "--depth" parameter.\n`);
}

inspect();
