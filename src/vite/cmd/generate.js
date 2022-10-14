/* eslint-disable import/no-dynamic-require */
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

argv.mode = 'ssg';

const { requireFromApp } = require('../helpers/packages');
const { log, fatal } = require('../helpers/logger');
const banner = require('../helpers/banner-global');
const checkCompilationCache = require('../helpers/check-compilation-cache');
const getQuasarCtx = require('../helpers/get-quasar-ctx');

async function run() {
  banner(argv, 'generate');

  // install ssr mode if it's missing
  const { add } = requireFromApp('@quasar/app-vite/lib/modes/ssr/ssr-installation');
  await add(true);

  const ctx = getQuasarCtx({
    mode: 'ssg',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined,
  });

  // register app extensions
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

  const regenerateTypesFeatureFlags = requireFromApp('@quasar/app-vite/lib/helpers/types-feature-flags');
  regenerateTypesFeatureFlags(quasarConf);

  const AppProdBuilder = require('../ssg-builder');
  const appBuilder = new AppProdBuilder({ argv, quasarConf });

  const artifacts = requireFromApp('@quasar/app-vite/lib/artifacts');
  artifacts.clean(quasarConf.ssg.distDir);

  const { needCompilation, writeCacheManifest } = await checkCompilationCache(argv, quasarConf);

  if (needCompilation) {
    artifacts.clean(quasarConf.ssg.compilationDir);

    const entryFiles = require('../entry-files-generator')();
    entryFiles.generate(quasarConf);

    if (typeof quasarConf.build.beforeBuild === 'function') {
      await quasarConf.build.beforeBuild({ quasarConf });
    }

    // run possible beforeBuild hooks
    await extensionRunner.runHook('beforeBuild', async (hook) => {
      log(`Extension(${hook.api.extId}): Running beforeBuild hook...`);
      await hook.fn(hook.api, { quasarConf });
    });

    await appBuilder.compile();
    artifacts.add(quasarConf.ssg.compilationDir);

    if (writeCacheManifest) {
      await writeCacheManifest();
    }

    if (typeof quasarConf.build.afterBuild === 'function') {
      await quasarConf.build.afterBuild({ quasarConf });
    }

    // run possible afterBuild hooks
    await extensionRunner.runHook('afterBuild', async (hook) => {
      log(`Extension(${hook.api.extId}): Running afterBuild hook...`);
      await hook.fn(hook.api, { quasarConf });
    });
  }

  await appBuilder.generatePages();
  artifacts.add(quasarConf.ssg.distDir);

  banner(argv, 'generate', {
    outputFolder: quasarConf.ssg.distDir,
    compilationFolder: quasarConf.ssg.compilationDir,
    target: quasarConf.build.target,
    fallback: quasarConf.ssg.fallback,
    cache: quasarConf.ssg.cache,
  });

  if (typeof quasarConf.ssg.afterGenerate === 'function') {
    const esmRequire = require('jiti')(__filename);

    const { globbySync } = esmRequire('globby');

    const files = globbySync('**/*.html', {
      cwd: quasarConf.ssg.distDir,
      absolute: true,
    });

    log('Running afterGenerate hook...');

    await quasarConf.ssg.afterGenerate(files, quasarConf.ssg.distDir);
  }
}

run();
