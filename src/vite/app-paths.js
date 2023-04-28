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
const publicDir = resolve(appDir, 'public');
const resolvedQuasarConfigFilename = resolve(appDir, quasarConfigFilename);

module.exports.appDir = appDir;
module.exports.quasarConfigFilename = resolvedQuasarConfigFilename;
module.exports.publicDir = publicDir;

module.exports.resolve = {
  app: (dir) => join(appDir, dir),
  appNodeModule: (name) => require.resolve(name, {
    paths: [appDir],
  }),
};
