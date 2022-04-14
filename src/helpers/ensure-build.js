/* eslint-disable global-require */
const destr = require('destr');
const fs = require('fs-extra');
const path = require('path');
const { log } = require('./logger');
const { makeSnapshot, compareSnapshots } = require('../build/snapshot');

module.exports = async function ensureBuild(api, quasarConfFile) {
  const { quasarConf } = quasarConfFile;
  const options = quasarConf.ssg;

  if (options.cache === false || quasarConfFile.opts['force-build']) {
    await require('../build')(api, quasarConfFile);

    return;
  }

  // Take a snapshot of current project
  const snapshotOptions = {
    rootDir: api.appDir,
    ignore: options.cache.ignore.map(path.posix.normalize),
    globbyOptions: options.cache.globbyOptions,
  };

  const currentBuildSnapshot = await makeSnapshot(snapshotOptions);

  // Current build meta
  const currentBuild = {
    quasarVersion: api.getPackageVersion('quasar'),
    quasarAppVersion: api.getPackageVersion('@quasar/app'),
    quasarExtrasVersion: api.getPackageVersion('@quasar/extras'),
    ssgAppExtensionVersion: api.getPackageVersion('quasar-app-extension-ssg'),
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

    if (!needBuild) {
      // Full snapshot diff
      log('Comparing previous build with current build...');

      const changed = compareSnapshots(previousBuild.snapshot, currentBuild.snapshot);

      if (!changed) {
        log('Skipping webpack build as no changes detected');

        return;
      }

      log(`Doing webpack rebuild because ${changed} modified`);
    }
  }

  await require('../build')(api, quasarConfFile);

  // Write build.json
  await fs.writeFile(quasarBuildFile, JSON.stringify(currentBuild, null, 2), 'utf-8');
};
