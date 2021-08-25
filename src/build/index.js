/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-void */
const chalk = require('chalk');
const pify = require('pify');
const appRequire = require('../helpers/app-require');
const banner = require('../helpers/banner').build;
const { log, warn } = require('../helpers/logger');
const { hasNewQuasarConfFile } = require('../helpers/compatibility');

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

module.exports = async function build(
  api,
  quasarConfFile,
  ctx,
  extensionRunner,
) {
  banner(api, ctx, 'build');

  const webpack = appRequire('webpack', api.appDir);

  const installMissing = appRequire(
    '@quasar/app/lib/mode/install-missing',
    api.appDir,
  );
  await installMissing(ctx.modeName, ctx.targetName);

  const Generator = appRequire('@quasar/app/lib/generator', api.appDir);
  const artifacts = appRequire('@quasar/app/lib/artifacts', api.appDir);
  const regenerateTypesFeatureFlags = appRequire(
    '@quasar/app/lib/helpers/types-feature-flags',
    api.appDir,
  );

  const generator = new Generator(quasarConfFile);

  const webpackConfig = hasNewQuasarConfFile(api)
    ? quasarConfFile.webpackConf
    : quasarConfFile.getWebpackConfig();

  const quasarConf = hasNewQuasarConfFile(api)
    ? quasarConfFile.quasarConf
    : quasarConfFile.getquasarConf();

  regenerateTypesFeatureFlags(quasarConf);

  const outputFolder = quasarConf.build.distDir;

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
    warn(
      chalk.red(`[FAIL] Build failed with ${errDetails}. Check log above.\n`),
    );

    process.exit(1);
  });

  const printWebpackStats = appRequire(
    '@quasar/app/lib/helpers/print-webpack-stats',
    api.appDir,
  );

  console.log();

  statsArray.forEach((stat, index) => {
    printWebpackStats(
      stat,
      webpackData.folder[index],
      webpackData.name[index],
    );
  });

  // free up memory
  // eslint-disable-next-line no-void
  webpackData = void 0;

  banner(api, ctx, 'build', {
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

  // eslint-disable-next-line no-void
  if (ctx.publish !== void 0) {
    const opts = {
      arg: ctx.publish,
      distDir: outputFolder,
      quasarConf,
    };

    if (typeof quasarConf.build.onPublish === 'function') {
      await quasarConf.build.onPublish(opts);
    }

    // run possible onPublish hooks
    await extensionRunner.runHook('onPublish', async (hook) => {
      log(`Extension(${hook.api.extId}): Running onPublish hook...`);
      await hook.fn(hook.api, opts);
    });
  }
};
