/* eslint-disable no-void */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const semver = require('semver');
const appPaths = require('./app-paths');

const getPackageJson = (pkgName, folder = appPaths.appDir) => {
  try {
    return require(
      require.resolve(`${pkgName}/package.json`, {
        paths: [folder],
      }),
    );
  } catch (e) {
    return void 0;
  }
};

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
