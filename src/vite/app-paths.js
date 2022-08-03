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

  const { fatal } = require('./helpers/logger');

  return fatal('Error. This command must be executed inside a Quasar project folder.');
}

appDir = getAppDir();

module.exports = {
  appDir,
  quasarConfigFilename: resolve(appDir, quasarConfigFilename),
  resolve: {
    app: (dir) => join(appDir, dir),
    appNodeModule: (name) => require.resolve(name, {
      paths: [appDir],
    }),
  },
};
