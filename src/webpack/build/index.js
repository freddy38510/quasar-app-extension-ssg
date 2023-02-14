/* eslint-disable no-void */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const pify = require('pify');
const Generator = require('./generator');
const { requireFromApp } = require('../helpers/packages');
const { logBuildBanner } = require('../helpers/banner');
const { log, fatal } = require('../helpers/logger');
const regenerateTypesFeatureFlags = require('../helpers/types-feature-flags');

const { splitWebpackConfig } = require('./symbols');

const webpack = requireFromApp('webpack');
const { printWebpackErrors } = requireFromApp('@quasar/app/lib/helpers/print-webpack-issue');
const artifacts = requireFromApp('@quasar/app/lib/artifacts');

function parseWebpackConfig(cfg, mode) {
  const data = splitWebpackConfig(cfg, mode);

  return {
    configs: data.map((d) => d.webpack),
    name: data.map((d) => d.name),
    folder: data.map((d) => d.webpack.output.path),
  };
}

module.exports = async function build(quasarConfFile) {
  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');

  await quasarConfFile.addWebpackConf();

  const generator = new Generator(quasarConfFile);

  const { quasarConf, webpackConf } = quasarConfFile;

  regenerateTypesFeatureFlags(quasarConf);

  const outputFolder = quasarConf.ssg.buildDir;

  artifacts.clean(outputFolder);

  generator.build();

  if (typeof quasarConf.build.beforeBuild === 'function') {
    await quasarConf.build.beforeBuild({ quasarConf });
  }

  // run possible beforeBuild hooks
  await extensionRunner.runHook('beforeBuild', async (hook) => {
    log(`Extension(${hook.api.extId}): Running beforeBuild hook...`);
    await hook.fn(hook.api, { quasarConf });
  });

  // using quasarConfFile.ctx instead of argv.mode
  // because SSR might also have PWA enabled but we
  // can only know it after parsing the quasar.config.js file
  if (quasarConfFile.quasarConf.ctx.mode.pwa === true) {
    const PwaRunner = requireFromApp('@quasar/app/lib/pwa');

    await PwaRunner.build(quasarConfFile);
  }

  let webpackData = parseWebpackConfig(webpackConf, 'ssg');

  const compiler = webpack(webpackData.configs);

  compiler.run = pify(compiler.run);
  const { err, stats: statsArray } = await compiler.run();

  if (err) {
    console.error(err.stack || err);

    if (err.details) {
      console.error(err.details);
    }

    process.exit(1);
  }

  artifacts.add(outputFolder);

  statsArray.forEach((stats, index) => {
    if (stats.hasErrors() !== true) {
      return;
    }

    const summary = printWebpackErrors(webpackData.name[index], stats);
    console.log();
    fatal(`for "${webpackData.name[index]}" with ${summary}. Please check the log above.`, 'COMPILATION FAILED');
  });

  const printWebpackStats = requireFromApp('@quasar/app/lib/helpers/print-webpack-stats');

  console.log();

  statsArray.forEach((stats, index) => {
    printWebpackStats(
      stats,
      webpackData.folder[index],
      webpackData.name[index],
    );
  });

  // free up memory
  webpackData = void 0;

  logBuildBanner(quasarConfFile.ctx, 'build', {
    outputFolder,
    transpileBanner: quasarConf.__transpileBanner,
  });

  if (typeof quasarConf.build.afterBuild === 'function') {
    await quasarConf.build.afterBuild({ quasarConf });
  }

  // run possible afterBuild hooks
  await extensionRunner.runHook('afterBuild', async (hook) => {
    log(`Extension(${hook.api.extId}): Running afterBuild hook...`);
    await hook.fn(hook.api, { quasarConf });
  });
};
