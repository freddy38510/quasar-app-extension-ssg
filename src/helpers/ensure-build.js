/* eslint-disable global-require */
const destr = require('destr');
const fs = require('fs-extra');
const path = require('path');
const { makeSnapshot, compareSnapshots } = require('../build/snapshot');
const { log } = require('./logger');
const { appDir } = require('./app-paths');
const { getPackageVersion } = require('./packages');

async function ensureBuild(quasarConfFile) {
  const { quasarConf } = quasarConfFile;

  const options = quasarConf.ssg;

  if (options.cache === false || quasarConfFile.opts['force-build']) {
    await require('../build')(quasarConfFile);
    return;
  }

  // Take a snapshot of current project
  const snapshotOptions = {
    rootDir: appDir,
    ignore: options.cache.ignore.map(path.posix.normalize),
    globbyOptions: options.cache.globbyOptions,
  };

  const currentBuildSnapshot = await makeSnapshot(snapshotOptions);

  // Current build meta
  const currentBuild = {
    quasarVersion: getPackageVersion('quasar'),
    quasarAppVersion: getPackageVersion('@quasar/app'),
    quasarExtrasVersion: getPackageVersion('@quasar/extras'),
    ssgAppExtensionVersion: getPackageVersion('quasar-app-extension-ssg'),
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
        log('Skipping webpack build as no changes detected \n');
        return;
      }

      log(`Doing webpack rebuild because ${changed} modified`);
    }
  }

  await require('../build')(quasarConfFile);

  // Write build.json
  fs.writeFileSync(quasarBuildFile, JSON.stringify(currentBuild, null, 2), 'utf-8');
}

module.exports = ensureBuild;
