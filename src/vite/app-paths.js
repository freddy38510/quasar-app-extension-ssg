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

  // eslint-disable-next-line no-console
  console.error('\n App • ⚠️  Error. This command must be executed inside a Quasar project folder.\n');

  return process.exit(1);
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
