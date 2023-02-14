/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
/* eslint-disable no-console */
/* eslint-disable global-require */

if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'production';
}

const { requireFromApp } = require('../helpers/packages');

const parseArgs = requireFromApp('minimist');

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
  console.log();
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
const ensureBuild = require('../helpers/ensure-build');
const getQuasarCtx = require('../helpers/get-quasar-ctx');
const { fatal } = require('../helpers/logger');
const { logBuildBanner } = require('../helpers/banner');
const { hasPackage } = require('../helpers/packages');

async function run() {
  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');

  if (hasPackage('@quasar/app', '>=3.3.0')) {
    const ensureVueDeps = requireFromApp('@quasar/app/lib/helpers/ensure-vue-deps');
    ensureVueDeps();
  }

  logBuildBanner(argv, 'build');

  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined,
  });

  if (hasPackage('@quasar/app', '< 3.4.0')) {
    const SSRDirectives = requireFromApp('@quasar/app/lib/ssr/ssr-directives');

    const directivesBuilder = new SSRDirectives();

    await directivesBuilder.build();
  }

  // do not run ssg extension again
  // TODO: extend ExtensionRunner class
  extensionRunner.extensions.splice(
    extensionRunner.extensions
      .findIndex((extension) => extension.extId === 'ssg'),
    1,
  );

  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx, argv);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.error(e);
    fatal(`${quasarConfigFilename} has JS errors`, 'FAIL');
  }

  await quasarConfFile.compile();

  await ensureBuild(quasarConfFile);

  await require('../generate')(quasarConfFile.quasarConf);
}

run();
