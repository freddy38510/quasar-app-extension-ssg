const destr = require('destr');
const path = require('path');
const { info } = require('./logger');
const { makeSnapshot, compareSnapshots } = require('./snapshot');
const { appDir } = require('../app-paths');
const { getPackageVersion, requireFromApp } = require('./packages');

const fse = requireFromApp('fs-extra');

module.exports = async function checkCompilationCache(argv, quasarConf) {
  let needCompilation = true;

  if (quasarConf.ssg.cache === false) {
    return { needCompilation };
  }

  const { ssg: options } = quasarConf;

  const cacheManifestFile = path.resolve(options.compilationDir, 'cache-manifest.json');
  const snapshotOptions = {
    rootDir: appDir,
    ignore: options.cache.ignore.map(path.posix.normalize),
    globbyOptions: options.cache.globbyOptions,
  };

  const currentManifest = {
    quasarVersion: getPackageVersion('quasar'),
    quasarCliVersion: getPackageVersion('@quasar/app-vite'),
    quasarExtrasVersion: getPackageVersion('@quasar/extras'),
    ssgAppExtensionVersion: getPackageVersion('quasar-app-extension-ssg'),
    ssr: quasarConf.ssr,
    snapshot: await makeSnapshot(snapshotOptions),
  };

  const writeCacheManifest = async () => {
    await fse.writeFile(cacheManifestFile, JSON.stringify(currentManifest, null, 2), 'utf-8');
  };

  if (argv['force-build']) {
    info('Force Compilation');

    return {
      needCompilation,
      writeCacheManifest,
    };
  }

  if (!fse.existsSync(cacheManifestFile)) {
    return {
      needCompilation,
      writeCacheManifest,
    };
  }

  const previousManifest = destr(fse.readFileSync(cacheManifestFile, 'utf-8')) || {};

  // Quick diff
  needCompilation = ['quasarVersion', 'quasarCliVersion', 'quasarExtrasVersion', 'ssr'].some((field) => {
    if (JSON.stringify(previousManifest[field])
      !== JSON.stringify(currentManifest[field])) {
      info(`Start Compilation because ${field} changed`);

      return true;
    }

    return false;
  });

  if (needCompilation) {
    return {
      needCompilation,
      writeCacheManifest,
    };
  }

  // Full snapshot diff
  const changed = compareSnapshots(
    previousManifest.snapshot,
    currentManifest.snapshot,
  );

  if (!changed) {
    info('Skip Compilation as no changes detected');

    return { needCompilation };
  }

  info(`Start Compilation because ${changed} modified`);

  return {
    needCompilation: true,
    writeCacheManifest,
  };
};
