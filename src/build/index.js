/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-void */
const chalk = require('chalk');
const pify = require('pify');
const appRequire = require('../helpers/app-require');
const banner = require('../helpers/banner').build;
const { log, warn } = require('../helpers/logger');

function splitConfig(webpackConfig) {
  return [
    { webpack: webpackConfig.server, name: 'Server' },
    { webpack: webpackConfig.client, name: 'Client' },
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

module.exports = async function build(api, quasarConfig, ctx, extensionRunner) {
  banner(api, ctx, 'build');

  const webpack = appRequire('webpack', api.appDir);

  const installMissing = appRequire('@quasar/app/lib/mode/install-missing', api.appDir);
  await installMissing(ctx.modeName, ctx.targetName);

  const Generator = appRequire('@quasar/app/lib/generator', api.appDir);
  const artifacts = appRequire('@quasar/app/lib/artifacts', api.appDir);
  const regenerateTypesFeatureFlags = appRequire('@quasar/app/lib/helpers/types-feature-flags', api.appDir);

  const generator = new Generator(quasarConfig);

  const hasNewQuasarConf = require('../helpers/compatibility')(api, '@quasar/app', '>=2.0.1');

  const webpackConfig = hasNewQuasarConf
    ? quasarConfig.webpackConf
    : quasarConfig.getWebpackConfig();

  const buildConfig = hasNewQuasarConf ? quasarConfig.quasarConf : quasarConfig.getBuildConfig();

  regenerateTypesFeatureFlags(buildConfig);

  const outputFolder = buildConfig.build.distDir;

  artifacts.clean(outputFolder);
  generator.build();

  if (typeof buildConfig.build.beforeBuild === 'function') {
    await buildConfig.build.beforeBuild({ quasarConf: buildConfig });
  }

  // run possible beforeBuild hooks
  await extensionRunner.runHook('beforeBuild', async (hook) => {
    log(`Extension(${hook.api.extId}): Running beforeBuild hook...`);
    await hook.fn(hook.api, { quasarConf: buildConfig });
  });

  log('Compiling with Webpack...');

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

    warn();
    warn(chalk.red(`${errDetails} encountered:\n`));

    info.errors.forEach((error) => {
      console.error(error);
    });

    warn();
    warn(chalk.red(`[FAIL] Build failed with ${errDetails}. Check log above.\n`));

    process.exit(1);
  });

  const printWebpackStats = appRequire('@quasar/app/lib/helpers/print-webpack-stats', api.appDir);

  console.log();

  statsArray.forEach((_stats, index) => {
    printWebpackStats(_stats, webpackData.folder[index], webpackData.name[index]);
  });

  // free up memory
  // eslint-disable-next-line no-void
  webpackData = void 0;

  banner(api, ctx, 'build', { outputFolder, transpileBanner: buildConfig.__transpileBanner });

  if (typeof buildConfig.build.afterBuild === 'function') {
    await buildConfig.build.afterBuild({ quasarConf: buildConfig });
  }

  // run possible afterBuild hooks
  await extensionRunner.runHook('afterBuild', async (hook) => {
    log(`Extension(${hook.api.extId}): Running afterBuild hook...`);
    await hook.fn(hook.api, { quasarConf: buildConfig });
  });

  // eslint-disable-next-line no-void
  if (ctx.publish !== void 0) {
    const opts = {
      arg: ctx.publish,
      distDir: outputFolder,
      quasarConf: buildConfig,
    };

    if (typeof buildConfig.build.onPublish === 'function') {
      await buildConfig.build.onPublish(opts);
    }

    // run possible onPublish hooks
    await extensionRunner.runHook('onPublish', async (hook) => {
      log(`Extension(${hook.api.extId}): Running onPublish hook...`);
      await hook.fn(hook.api, opts);
    });
  }
};
