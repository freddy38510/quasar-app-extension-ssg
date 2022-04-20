/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra');
const { join } = require('path');
const Generator = require('./generator');
const requireFromApp = require('../helpers/require-from-app');
const banner = require('../helpers/banner').generate;
const { log, error } = require('../helpers/logger');

module.exports = async (quasarConf) => {
  const { add, clean } = requireFromApp('@quasar/app/lib/artifacts');

  const generator = new Generator(quasarConf);

  banner();

  clean(quasarConf.ssg.__distDir);

  log('Copying assets...');

  await fs.copy(join(quasarConf.build.distDir, 'www'), quasarConf.ssg.__distDir);

  const { errors, warnings } = await generator.generate();

  if (quasarConf.ctx.mode.pwa) {
    const buildWorkbox = require('./workbox.js');

    try {
      await buildWorkbox(quasarConf);
    } catch (err) {
      error(err.stack || err);

      errors.push(err);
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
    } catch (err) {
      error(err.stack || err);

      errors.push(err);
    }
  }

  add(quasarConf.ssg.__distDir);

  return { errors, warnings };
};
