/* eslint-disable no-void */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const appPaths = require('./app-paths');

let hasNewQuasarPkg;

function canResolveNewQuasarPkg() {
  if (hasNewQuasarPkg !== undefined) {
    return hasNewQuasarPkg;
  }

  let isResolved = true;

  try {
    require.resolve('@quasar/app-webpack/package.json', {
      paths: [appPaths.appDir],
    });
  } catch (e) {
    isResolved = false;
  }

  return isResolved;
}

function getPackageName(packageName) {
  if (packageName === '@quasar/app') {
    return hasNewQuasarPkg ? '@quasar/app-webpack'
      : packageName;
  }

  return packageName;
}

const getPackageJson = (pkgName, folder = appPaths.appDir) => {
  try {
    return require(
      require.resolve(`${pkgName}/package.json`, {
        paths: [folder],
      }),
    );
  } catch (e) {
    if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      return {};
    }

    return void 0;
  }
};

hasNewQuasarPkg = canResolveNewQuasarPkg();

module.exports.hasNewQuasarPkg = hasNewQuasarPkg;

module.exports.requireFromApp = (module) => require(appPaths.resolve.appNodeModule(module));

const semver = this.requireFromApp('semver');

module.exports.hasPackage = function hasPackage(packageName, semverCondition) {
  const name = getPackageName(packageName);
  const json = getPackageJson(name);

  if (json === void 0) {
    return false;
  }

  return semverCondition !== void 0
    ? semver.satisfies(json.version, semverCondition)
    : true;
};

module.exports.getPackageVersion = function getPackageVersion(packageName) {
  const name = getPackageName(packageName);
  const json = getPackageJson(name);

  return json !== void 0
    ? json.version
    : void 0;
};
