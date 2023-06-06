/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const { join } = require('path');
const { requireFromApp } = require('../../api');
const Generator = require('./generator');
const { logGenerateBanner } = require('../helpers/banner');
const {
  log, info, warn, error, warning, fatal, success,
} = require('../helpers/logger');
const { printGeneratorErrors, printGeneratorWarnings } = require('../helpers/print-generator-issue');

const fse = requireFromApp('fs-extra');

module.exports = async function generate(quasarConf) {
  const { add, clean } = requireFromApp('@quasar/app-webpack/lib/artifacts');

  const renderToString = require(join(quasarConf.ssg.buildDir, './render-to-string.js'));
  const serverManifest = require(join(quasarConf.ssg.buildDir, './quasar.server-manifest.json'));

  const generator = new Generator(
    quasarConf,
    renderToString,
  );

  const state = {
    errors: [],
    warnings: [],
    startTime: null,
  };

  logGenerateBanner(quasarConf.ctx);

  clean(quasarConf.ssg.distDir);

  log('Copying assets...');

  try {
    await fse.copy(
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

    const { routes, warnings } = await generator.initRoutes(serverManifest);

    state.warnings = warnings;

    info('Generating pages in progress...', 'WAIT');

    const { errors } = await generator.generateRoutes(routes);

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
    const buildWorkbox = require('./workbox');

    await buildWorkbox(quasarConf);
  }

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

  add(quasarConf.ssg.distDir);

  logGenerateBanner(quasarConf.ctx, {
    outputFolder: quasarConf.ssg.distDir,
    fallback: quasarConf.ssg.fallback,
  });
};
