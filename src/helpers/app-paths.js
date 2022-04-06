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

function canResolveNewQuasarPkg() {
  if (hasNewQuasarPackage !== undefined) {
    return hasNewQuasarPackage;
  }

  let isResolved = true;

  try {
    require.resolve('@quasar/app-webpack/package.json', {
      paths: [appDir],
    });
  } catch (e) {
    isResolved = false;
  }

  return isResolved;
}

function getModuleNameOrPath(moduleNameOrPath) {
  if (moduleNameOrPath.startsWith('@quasar/app/')) {
    return hasNewQuasarPackage ? moduleNameOrPath.replace('@quasar/app/', '@quasar/app-webpack/') : moduleNameOrPath;
  }

  return moduleNameOrPath;
}

appDir = getAppDir();
hasNewQuasarPackage = canResolveNewQuasarPkg();

module.exports = {
  appDir,
  quasarConfigFilename: resolve(appDir, quasarConfigFilename),
  resolve: {
    app: (dir) => join(appDir, dir),
    appNodeModule: (module) => require.resolve(getModuleNameOrPath(module), {
      paths: [appDir],
    }),
  },
};
