/* eslint-disable no-void */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

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

const webpackDeps = [
  '@freddy38510/vue-loader',
  '@freddy38510/vue-style-loader',
];

const viteDeps = [
  '@rollup/plugin-node-resolve',
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

const { createRequire } = require('module');

const requireFromApp = createRequire(join(appDir, quasarConfigFilename));

const semver = requireFromApp('semver');

const getPackageJson = (pkgName) => {
  try {
    return require(
      requireFromApp.resolve(`${pkgName}/package.json`),
    );
  } catch (e) {
    // console.log(e); // uncomment to debug false positive

    if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      return {};
    }

    return void 0;
  }
};

function getPackageVersion(pkgName) {
  const json = getPackageJson(pkgName);

  return json !== void 0
    ? json.version
    : void 0;
}

function hasPackage(pkgName, semverCondition) {
  const json = getPackageJson(pkgName);

  if (json === void 0) {
    return false;
  }

  return semverCondition !== void 0
    ? semver.satisfies(json.version, semverCondition)
    : true;
}

const hasVite = hasPackage('@quasar/app-vite');

module.exports.requireFromApp = requireFromApp;

module.exports.hasPackage = hasPackage;

module.exports.getPackageVersion = getPackageVersion;

module.exports.engine = `@quasar/app-${hasVite ? 'vite' : 'webpack'}`;

module.exports.hasVite = hasVite;

module.exports.ssgDeps = hasVite ? viteDeps : webpackDeps;
