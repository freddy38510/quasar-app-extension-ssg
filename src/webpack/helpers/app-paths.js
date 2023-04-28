const fs = require('fs');
const {
  normalize, resolve, join, sep,
} = require('path');

let quasarConfigFilename;

function getAppDir() {
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

const appDir = getAppDir();

function tryToResolveNewQuasarPkg() {
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

const hasNewQuasarPkg = tryToResolveNewQuasarPkg();

function getModuleId(id) {
  if (id.startsWith('@quasar/app/')) {
    return hasNewQuasarPkg ? id.replace('@quasar/app/', '@quasar/app-webpack/') : id;
  }

  return id;
}

module.exports.appDir = appDir;
module.exports.quasarConfigFilename = resolve(appDir, quasarConfigFilename);
module.exports.resolve = {
  app: (dir) => join(appDir, dir),
  appNodeModule: (id) => require.resolve(getModuleId(id), {
    paths: [appDir],
  }),
};
