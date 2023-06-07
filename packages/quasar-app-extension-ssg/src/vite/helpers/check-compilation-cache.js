const { resolve, posix } = require('path');
const { existsSync } = require('fs');
const { writeFile, readFile } = require('fs/promises');
const appPaths = require('@quasar/app-vite/lib/app-paths');
const { info } = require('./logger');
const { makeSnapshot, compareSnapshots } = require('./snapshot');
const {
  quasarVersion, cliAppVersion, quasarExtrasVersion, ssgVersion,
} = require('./banner-global');

module.exports = async function checkCompilationCache(argv, quasarConf) {
  let needCompilation = true;

  if (quasarConf.ssg.cache === false) {
    return { needCompilation };
  }

  const { ssg: options } = quasarConf;

  const cacheManifestFile = resolve(options.compilationDir, 'cache-manifest.json');
  const snapshotOptions = {
    rootDir: appPaths.appDir,
    ignore: options.cache.ignore.map(posix.normalize),
    globbyOptions: options.cache.globbyOptions,
  };

  const currentManifest = {
    quasarVersion,
    cliAppVersion,
    quasarExtrasVersion,
    ssgVersion,
    ssr: quasarConf.ssr,
    snapshot: await makeSnapshot(snapshotOptions),
  };

  const writeCacheManifest = async () => {
    await writeFile(cacheManifestFile, JSON.stringify(currentManifest, null, 2), 'utf-8');
  };

  if (argv['force-build']) {
    info('Force Compilation');

    return {
      needCompilation,
      writeCacheManifest,
    };
  }

  if (!existsSync(cacheManifestFile)) {
    return {
      needCompilation,
      writeCacheManifest,
    };
  }

  const destr = require('destr');
  const previousManifest = destr(await readFile(cacheManifestFile, 'utf-8')) || {};

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
