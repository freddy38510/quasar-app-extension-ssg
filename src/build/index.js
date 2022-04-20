/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-void */
const chalk = require('chalk');
const pify = require('pify');
const Generator = require('./generator');
const requireFromApp = require('../helpers/require-from-app');
const banner = require('../helpers/banner').build;
const { log, error } = require('../helpers/logger');
const { hasNewQuasarConfFile } = require('../helpers/compatibility');

const webpack = requireFromApp('webpack');

function splitConfig(webpackConf) {
  return [
    ...(webpackConf.csw ? [{ webpack: webpackConf.csw, name: 'Custom Service Worker' }] : [{}]),
    { webpack: webpackConf.generator, name: 'Generator' },
    { webpack: webpackConf.server, name: 'Server' },
    { webpack: webpackConf.client, name: 'Client' },
  ];
}

function parseWebpackConfig(cfg) {
  const data = splitConfig(cfg);

  return {
    configs: data.map((d) => d.webpack),
    name: data.map((d) => d.name),
    folder: data.map((d) => d.webpack.output.path),
  };
}

module.exports = async function build(quasarConfFile) {
  const extensionRunner = requireFromApp('@quasar/app/lib/app-extension/extensions-runner');
  const artifacts = requireFromApp('@quasar/app/lib/artifacts');
  const regenerateTypesFeatureFlags = requireFromApp('@quasar/app/lib/helpers/types-feature-flags');

  const generator = new Generator(quasarConfFile);

  const quasarConf = hasNewQuasarConfFile
    ? quasarConfFile.quasarConf
    : quasarConfFile.getquasarConf();

  const webpackConfig = await require('./webpack')(quasarConf);

  if (hasNewQuasarConfFile) {
    quasarConfFile.webpackConf = webpackConfig;
  } else {
    quasarConfFile.getWebpackConfig = () => webpackConfig;
  }

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

  let webpackData = parseWebpackConfig(webpackConfig);

  const compiler = webpack(webpackData.configs);

  compiler.run = pify(compiler.run);
  const { err, stats } = await compiler.run();

  if (err) {
    console.error(err.stack || err);

    if (err.details) {
      console.error(err.details);
    }

    process.exit(1);
  }

  artifacts.add(outputFolder);

  const statsArray = stats.stats || stats;

  statsArray.forEach((stat) => {
    if (stat.hasErrors() !== true) {
      return;
    }

    const info = stat.toJson();
    const errNumber = info.errors.length;
    const errDetails = `${errNumber} error${errNumber > 1 ? 's' : ''}`;

    error();
    error(chalk.red(`${errDetails} encountered:\n`));

    info.errors.forEach((e) => {
      console.error(e);
    });

    error();
    error(
      chalk.red(`[FAIL] Build failed with ${errDetails}. Check log above.\n`),
    );

    process.exit(1);
  });

  const printWebpackStats = requireFromApp('@quasar/app/lib/helpers/print-webpack-stats');

  console.log();

  statsArray.forEach((stat, index) => {
    printWebpackStats(
      stat,
      webpackData.folder[index],
      webpackData.name[index],
    );
  });

  // free up memory
  webpackData = void 0;

  banner(quasarConf.ctx, {
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
