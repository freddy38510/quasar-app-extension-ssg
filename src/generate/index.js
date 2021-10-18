/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra');
const { join } = require('path');
const Generator = require('./generator');
const appRequire = require('../helpers/app-require');
const banner = require('../helpers/banner').generate;
const {
  log, info, error, fatal, success,
} = require('../helpers/logger');
const printGeneratorErrors = require('../helpers/print-generator-errors');

module.exports = async (api, quasarConf, ctx) => {
  const { add, clean } = appRequire('@quasar/app/lib/artifacts', api.appDir);

  const generator = new Generator(api, quasarConf, ctx);

  let errors = [];

  banner(api, ctx, 'generate');

  clean(quasarConf.ssg.__distDir);

  log('Copying assets...');

  try {
    await fs.copy(
      join(quasarConf.build.distDir, 'www'),
      quasarConf.ssg.__distDir,
    );
  } catch (err) {
    err.message = `Could not copy assets\n\n${err.message}`;

    console.error(err.stack || err);

    process.exit(1);
  }

  const startTime = +new Date();

  try {
    const routes = await generator.initRoutes();

    info('Generating pages in progress...', 'WAIT');

    ({ errors } = await generator.generateRoutes(routes));
  } catch (err) {
    console.error(err.stack || err);

    process.exit(1);
  }

  const diffTime = +new Date() - startTime;

  if (errors.length > 0) {
    error(`Pages generated with errors • ${diffTime}ms`, 'DONE');

    const summary = printGeneratorErrors(errors);

    fatal(`with ${summary}. Please check the log above.`, 'GENERATE FAILED');
  } else {
    success(`Pages generated with success • ${diffTime}ms`, 'DONE');
  }

  if (quasarConf.ctx.mode.pwa) {
    const buildWorkbox = require('./workbox.js');

    await buildWorkbox(api, quasarConf);
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

  banner(api, ctx, 'generate', {
    outputFolder: quasarConf.ssg.__distDir,
    fallback: quasarConf.ssg.fallback,
  });
};
