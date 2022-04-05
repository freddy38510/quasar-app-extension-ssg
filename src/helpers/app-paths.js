/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs');
const {
  normalize, resolve, join, sep,
} = require('path');

let quasarConfigFilename;
let appDir;
let hasNewQuasarPackage;

function getAppDir() {
  if (appDir !== undefined) {
    return appDir;
  }

  let dir = process.cwd();

  while (dir.length && dir[dir.length - 1] !== sep) {
    if (fs.existsSync(join(dir, 'quasar.config.js'))) {
      quasarConfigFilename = 'quasar.config.js';
      return dir;
    }
    if (fs.existsSync(join(dir, 'quasar.conf.js'))) {
      quasarConfigFilename = 'quasar.conf.js';
      return dir;
    }

    dir = normalize(join(dir, '..'));
  }

  const { fatal } = require('./logger');

  return fatal('Error. This command must be executed inside a Quasar project folder.');
}

function resolveNewQuasarPackage() {
  if (hasNewQuasarPackage !== undefined) {
    return hasNewQuasarPackage;
  }

  let isResolved = true;

  try {
    require(
      require.resolve('@quasar/app-webpack/package.json', {
        paths: [appDir],
      }),
    );
  } catch (e) {
    isResolved = false;
  }

  return isResolved;
}

function getPackageName(packageName) {
  if (packageName === '@quasar/app') {
    return hasNewQuasarPackage ? '@quasar/app-webpack' : packageName;
  }

  return packageName;
}

function getModulePath(modulePath) {
  if (modulePath.startsWith('@quasar/app')) {
    return hasNewQuasarPackage ? modulePath.replace('@quasar/app', '@quasar/app-webpack') : modulePath;
  }

  return modulePath;
}

appDir = getAppDir();
hasNewQuasarPackage = resolveNewQuasarPackage();

module.exports = {
  appDir,
  quasarConfigFilename: resolve(appDir, quasarConfigFilename),
  resolve: {
    app: (dir) => join(appDir, dir),
    appPackage: (name) => join(appDir, 'node_modules', getPackageName(name)),
    appModule: (module) => join(appDir, 'node_modules', getModulePath(module)),
  },
};
