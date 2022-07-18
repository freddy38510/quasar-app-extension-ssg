/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs');
const {
  normalize, resolve, join, sep,
} = require('path');

let quasarConfigFilename;
let appDir;

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

function getModuleNameOrPath(moduleNameOrPath) {
  if (moduleNameOrPath.startsWith('@quasar/app/')) {
    const { hasNewQuasarPkg } = require('./packages'); // load here to avoid circular dependency

    return hasNewQuasarPkg ? moduleNameOrPath.replace('@quasar/app/', '@quasar/app-webpack/') : moduleNameOrPath;
  }

  return moduleNameOrPath;
}

appDir = getAppDir();

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
