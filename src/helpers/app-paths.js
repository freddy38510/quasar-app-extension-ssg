/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs');
const {
  normalize, join, sep,
} = require('path');

let appDir;

function getAppDir() {
  if (appDir !== undefined) {
    return appDir;
  }

  let dir = process.cwd();

  while (dir.length && dir[dir.length - 1] !== sep) {
    if (fs.existsSync(join(dir, 'quasar.conf.js'))) {
      return dir;
    }

    dir = normalize(join(dir, '..'));
  }

  const { fatal } = require('./logger');

  return fatal('Error. This command must be executed inside a Quasar project folder.');
}

appDir = getAppDir();

module.exports = {
  appDir,
  resolve: {
    app: (dir) => join(appDir, dir),
    appNodeModule: (module) => require.resolve(module, {
      paths: [appDir],
    }),
  },
};
