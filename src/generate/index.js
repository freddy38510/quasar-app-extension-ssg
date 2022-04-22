/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra');
const { join } = require('path');
const { green, bold } = require('chalk');
const Generator = require('./generator');
const requireFromApp = require('../helpers/require-from-app');
const banner = require('../helpers/banner').generate;
const {
  log, warn, error, fatal,
} = require('../helpers/logger');

module.exports = async (quasarConf) => {
  const { add, clean } = requireFromApp('@quasar/app/lib/artifacts');

  const generator = new Generator(quasarConf);

  const state = {
    errors: [],
    warnings: [],
    startTime: null,
  };

  banner();

  clean(quasarConf.ssg.__distDir);

  log('Copying assets...');

  try {
    await fs.copy(join(quasarConf.build.distDir, 'www'), quasarConf.ssg.__distDir);
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

    log('Generating pages in progress...');

    const { errors } = await generator.generateRoutes(routes);

    state.errors = errors;
  } catch (err) {
    console.error(err.stack || err);

    process.exit(1);
  }

  const diffTime = +new Date() - state.startTime;

  if (state.errors.length > 0) {
    error(`Pages generated with error(s) • ${diffTime}ms\n`);

    state.errors.forEach(({ route, error: err }) => {
      error(`Failed to generate page for route ${bold(route)}\n`);

      console.error(err.stack || err);
    });

    error('Pages generation failed. Please check the log above.');

    if (quasarConf.ctx.failOnError) {
      fatal('Exiting with non-zero code.\n');
    }
  } else if (state.warnings.length > 0) {
    warn(`Pages generated with warning(s) • ${diffTime}ms\n`);

    warn('Failed to initialize routes\n');

    state.warnings.forEach((err) => {
      console.warn(err.stack || err);
    });

    warn('Pages generation succeeded, but with warning(s). Please check log above.');
  } else {
    log(green(`Pages generated with success • ${diffTime}ms`));
  }

  if (quasarConf.ctx.mode.pwa) {
    const buildWorkbox = require('./workbox.js');

    try {
      await buildWorkbox(quasarConf);
    } catch (err) {
      console.error();

      console.error(err.stack || err);

      if (quasarConf.ctx.failOnError) {
        fatal('Exiting with non-zero code.\n');
      }
    }
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

  banner(quasarConf.ctx, { distDir: quasarConf.ssg.__distDir, fallback: quasarConf.ssg.fallback });
};
