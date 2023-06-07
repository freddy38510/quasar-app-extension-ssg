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

const { join } = require('path');
const appPaths = require('@quasar/app-webpack/lib/app-paths');
const ensureVueDeps = require('@quasar/app-webpack/lib/helpers/ensure-vue-deps');
const {
  log, info, warn, error, warning, fatal, success,
} = require('../helpers/logger');
const { displayBuildBanner, displayGenerateBanner } = require('../helpers/banner');

ensureVueDeps();
displayBuildBanner(argv, 'build');

(async () => {
  const extensionRunner = require('@quasar/app-webpack/lib/app-extension/extensions-runner');
  const QuasarConfFile = require('../quasar-config-file');
  const ensureBuild = require('../helpers/ensure-build');
  const getQuasarCtx = require('../helpers/get-quasar-ctx');

  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined,
  });

  // remove ssg extension (otherwise the ext will be run again)
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
    fatal(`${appPaths.quasarConfigFilename} has JS errors`, 'FAIL');
  }

  await quasarConfFile.compile();

  await ensureBuild(quasarConfFile);

  const { quasarConf } = quasarConfFile;

  const { copy } = require('fs-extra');
  const { add, clean } = require('@quasar/app-webpack/lib/artifacts');
  const PagesGenerator = require('../PagesGenerator');
  const { printGeneratorErrors, printGeneratorWarnings } = require('../helpers/print-generator-issue');

  const renderToString = require(join(quasarConf.ssg.buildDir, './render-to-string.js'));
  const serverManifest = require(join(quasarConf.ssg.buildDir, './quasar.server-manifest.json'));

  const pagesGenerator = new PagesGenerator(
    quasarConf,
    renderToString,
  );

  const state = {
    errors: [],
    warnings: [],
    startTime: null,
  };

  displayGenerateBanner(quasarConf.ctx);

  clean(quasarConf.ssg.distDir);

  log('Copying assets...');

  try {
    await copy(
      join(quasarConf.ssg.buildDir, 'www'),
      quasarConf.ssg.distDir,
    );
  } catch (err) {
    console.error(err);

    process.exit(1);
  }

  try {
    state.startTime = +new Date();

    log('Initializing routes...');

    const { routes, warnings } = await pagesGenerator.initRoutes(serverManifest);

    state.warnings = warnings;

    info('Generating pages in progress...', 'WAIT');

    const { errors } = await pagesGenerator.generate(routes);

    state.errors = errors;
  } catch (err) {
    console.error(err);

    process.exit(1);
  }

  const diffTime = +new Date() - state.startTime;

  if (state.errors.length > 0) {
    error(`Pages generated with errors • ${diffTime}ms`, 'DONE');

    const summary = printGeneratorErrors(state.errors);

    console.log();

    fatal(`with ${summary}. Please check the log above.`, 'GENERATE FAILED');
  } else if (state.warnings.length > 0) {
    warning(`Pages generated, but with warnings • ${diffTime}ms`, 'DONE');

    const summary = printGeneratorWarnings(state.warnings);

    console.log();

    warn(`Pages generated with success, but with ${summary}. Check log above.\n`);
  } else {
    success(`Pages generated with success • ${diffTime}ms`, 'DONE');
  }

  if (quasarConf.ctx.mode.pwa) {
    const { buildPwaServiceWorker } = require('../helpers/pwa-utils');

    await buildPwaServiceWorker(quasarConf);
  }

  if (typeof quasarConf.ssg.afterGenerate === 'function') {
    const { globby } = await import('globby');

    const files = await globby('**/*.html', {
      cwd: quasarConf.ssg.distDir,
      absolute: true,
    });

    log('Running afterGenerate hook...');

    await quasarConf.ssg.afterGenerate(files, quasarConf.ssg.distDir);
  }

  add(quasarConf.ssg.distDir);

  displayGenerateBanner(quasarConf.ctx, {
    outputFolder: quasarConf.ssg.distDir,
    fallback: quasarConf.ssg.fallback,
  });
})();
