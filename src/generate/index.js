/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra');
const { join } = require('path');
const Generator = require('./generator');
const requireFromApp = require('../helpers/require-from-app');
const { logGenerateBanner } = require('../helpers/banner');
const {
  log, info, warn, error, warning, fatal, success,
} = require('../helpers/logger');
const { printGeneratorErrors, printGeneratorWarnings } = require('../helpers/print-generator-issue');

module.exports = async (quasarConf) => {
  const { add, clean } = requireFromApp('@quasar/app/lib/artifacts');

  const generator = new Generator(quasarConf);

  const state = {
    errors: [],
    warnings: [],
    startTime: null,
  };

  logGenerateBanner(quasarConf.ctx);

  clean(quasarConf.ssg.__distDir);

  log('Copying assets...');

  try {
    await fs.copy(
      join(quasarConf.ssg.buildDir, 'www'),
      quasarConf.ssg.__distDir,
    );
  } catch (err) {
    err.message = `Could not copy assets\n\n${err.message}`;

    console.error(err.stack || err);

    process.exit(1);
  }

  try {
    state.startTime = +new Date();

    log('Initializing routes...');

    const { routes, warnings } = await generator.initRoutes();

    state.warnings = warnings;

    info('Generating pages in progress...', 'WAIT');

    const { errors } = await generator.generateRoutes(routes);

    state.errors = errors;
  } catch (err) {
    console.error(err.stack || err);

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
    const glob = require('glob');

    const files = glob.sync('**/*.html', {
      cwd: quasarConf.ssg.__distDir,
      absolute: true,
    });

    log('Running afterGenerate hook...');

    await quasarConf.ssg.afterGenerate(files, quasarConf.ssg.__distDir);
  }

  add(quasarConf.ssg.__distDir);

  logGenerateBanner(quasarConf.ctx, {
    outputFolder: quasarConf.ssg.__distDir,
    fallback: quasarConf.ssg.fallback,
  });
};
