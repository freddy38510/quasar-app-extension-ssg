/* eslint-disable no-void */
/* eslint-disable no-console */
/* eslint-disable global-require */

if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'production';
}

const parseArgs = require('minimist');

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

const QuasarConfFile = require('../conf');
const { quasarConfigFilename } = require('../helpers/app-paths');
const requireFromApp = require('../helpers/require-from-app');
const ensureBuild = require('../helpers/ensure-build');
const getQuasarCtx = require('../helpers/get-quasar-ctx');
const { fatal } = require('../helpers/logger');

module.exports = async function run(api) {
  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');

  if (api.hasPackage('@quasar/app', '>=3.3.0')) {
    const ensureVueDeps = requireFromApp('@quasar/app/lib/helpers/ensure-vue-deps');
    ensureVueDeps();
  }

  const installMissing = requireFromApp('@quasar/app/lib/mode/install-missing');

  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined,
  });

  await installMissing('ssr');

  // do not run ssg extension again
  extensionRunner.extensions.splice(
    extensionRunner.extensions
      .findIndex((extension) => extension.extId !== api.extId),
    1,
  );

  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(api, ctx, argv);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.error(e);
    fatal(`${quasarConfigFilename} has JS errors`, 'FAIL');
  }

  await quasarConfFile.compile();

  await ensureBuild(api, quasarConfFile, extensionRunner);

  await require('../generate')(api, quasarConfFile.quasarConf);
};
