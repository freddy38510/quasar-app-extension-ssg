/* eslint-disable no-void */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const appPaths = require('./app-paths');

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

module.exports.requireFromApp = (module) => require(appPaths.resolve.appNodeModule(module));

const semver = this.requireFromApp('semver');

module.exports.hasPackage = function hasPackage(packageName, semverCondition) {
  const json = getPackageJson(packageName);

  if (json === void 0) {
    return false;
  }

  return semverCondition !== void 0
    ? semver.satisfies(json.version, semverCondition)
    : true;
};

module.exports.getPackageVersion = function getPackageVersion(packageName) {
  const json = getPackageJson(packageName);

  return json !== void 0
    ? json.version
    : void 0;
};
