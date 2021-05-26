/* eslint-disable global-require */
const destr = require('destr');
const fs = require('fs-extra');
const path = require('path');
const upath = require('upath');
const build = require('.');
const { log } = require('../helpers/logger');
const { makeSnapshot, compareSnapshots } = require('./snapshot');
const { hasNewQuasarConfFile } = require('../helpers/compatibility');

async function ensureBuild(api, quasarConfFile, ctx, extensionRunner, forceBuild = false) {
  const quasarConf = hasNewQuasarConfFile(api)
    ? quasarConfFile.quasarConf : quasarConfFile.getBuildConfig();
  const options = quasarConf.ssg;

  if (options.cache === false || forceBuild) {
    await build(api, quasarConfFile, ctx, extensionRunner);
    return;
  }

  // Take a snapshot of current project
  const snapshotOptions = {
    rootDir: api.appDir,
    ignore: options.cache.ignore.map(upath.normalize),
    globbyOptions: options.cache.globbyOptions,
  };

  const currentBuildSnapshot = await makeSnapshot(snapshotOptions);

  // Current build meta
  const currentBuild = {
    quasarVersion: api.getPackageVersion('quasar'),
    quasarAppVersion: api.getPackageVersion('@quasar/app'),
    quasarExtrasVersion: api.getPackageVersion('@quasar/extras'),
    ssr: quasarConf.ssr,
    snapshot: currentBuildSnapshot,
  };

  // Check if build can be skipped
  const quasarBuildFile = path.resolve(options.buildDir, 'build.json');

  if (fs.existsSync(quasarBuildFile)) {
    const previousBuild = destr(fs.readFileSync(quasarBuildFile, 'utf-8')) || {};

    // Quick diff
    let needBuild = false;

    ['quasarVersion', 'quasarAppVersion', 'quasarExtrasVersion', 'ssr'].some((field) => {
      if (JSON.stringify(previousBuild[field]) !== JSON.stringify(currentBuild[field])) {
        needBuild = true;

        log(`Doing webpack rebuild because ${field} changed`);

        return true;
      }

      return false;
    });

    // Full snapshot diff
    if (!needBuild) {
      log('Comparing previous build with current build...');

      const changed = compareSnapshots(previousBuild.snapshot, currentBuild.snapshot);

      if (!changed) {
        log('Skipping webpack build as no changes detected');
        return;
      }

      log(`Doing webpack rebuild because ${changed} modified`);
    }
  }

  await build(api, quasarConfFile, ctx, extensionRunner);

  // Write build.json
  fs.writeFileSync(quasarBuildFile, JSON.stringify(currentBuild, null, 2), 'utf-8');
}

module.exports = ensureBuild;
