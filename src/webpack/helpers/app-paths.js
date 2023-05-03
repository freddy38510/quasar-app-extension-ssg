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
module.exports.quasarConfigFilename = join(appDir, quasarConfigFilename);
module.exports.resolve = {
  app: (dir) => join(appDir, dir),
  appNodeModule: (id) => require.resolve(getModuleId(id), {
    paths: [appDir],
  }),
};
