/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra');
const { join } = require('path');
const Generator = require('./generator');
const appRequire = require('../helpers/app-require');
const banner = require('../helpers/banner').generate;
const { log, warn } = require('../helpers/logger');

module.exports = async (api, quasarConf, ctx) => {
  const { add, clean } = appRequire('@quasar/app/lib/artifacts', api.appDir);

  const generator = new Generator(api, quasarConf, ctx);

  banner();

  clean(quasarConf.ssg.__distDir);

  log('Copying assets...');

  await fs.copy(join(quasarConf.build.distDir, 'www'), quasarConf.ssg.__distDir);

  log('Generating routes...');

  const { errors } = await generator.generate();

  if (quasarConf.ctx.mode.pwa) {
    const buildWorkbox = require('./workbox.js');

    try {
      await buildWorkbox(api, quasarConf, ctx);
    } catch (error) {
      warn(error.stack || error);

      warn('Could not build service-worker.js');
    }
  }

  if (typeof quasarConf.ssg.afterGenerate === 'function') {
    const glob = require('glob');

    const files = glob.sync('**/*.html', {
      cwd: quasarConf.ssg.__distDir,
      absolute: true,
    });

    try {
      log('Running afterGenerate hook...');

      await quasarConf.ssg.afterGenerate(files, quasarConf.ssg.__distDir);
    } catch (error) {
      warn(error);
    }
  }

  add(quasarConf.ssg.__distDir);

  return { errors };
};
