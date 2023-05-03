const { existsSync } = require('fs');
const {
  normalize,
  join,
  sep,
} = require('path');

const quasarConfigFilenameList = [
  'quasar.config.js',
  'quasar.config.cjs',
  'quasar.conf.js', // legacy
];

function getAppInfo() {
  let appDir = process.cwd();

  while (appDir.length && appDir[appDir.length - 1] !== sep) {
    const dir = appDir;
    const quasarConfigFilename = quasarConfigFilenameList.find(
      (name) => existsSync(join(dir, name)),
    );

    if (quasarConfigFilename) {
      return { appDir, quasarConfigFilename };
    }

    appDir = normalize(join(appDir, '..'));
  }

  // eslint-disable-next-line no-console
  console.error('\n App • ⚠️  Error. This command must be executed inside a Quasar project folder.\n');

  return process.exit(1);
}

const { appDir, quasarConfigFilename } = getAppInfo();

module.exports.appDir = appDir;
module.exports.quasarConfigFilename = join(appDir, quasarConfigFilename);
module.exports.resolve = {
  app: (dir) => join(appDir, dir),
  appNodeModule: (id) => require.resolve(id, {
    paths: [appDir],
  }),
};
