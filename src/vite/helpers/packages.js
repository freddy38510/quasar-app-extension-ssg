/* eslint-disable no-void */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const semver = require('semver');
const { appDir, resolve } = require('../app-paths');

const getPackageJson = (pkgName, folder = appDir) => {
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

module.exports.hasPackage = function hasPackage(pkgName, semverCondition) {
  const json = getPackageJson(pkgName);

  if (json === void 0) {
    return false;
  }

  return semverCondition !== void 0
    ? semver.satisfies(json.version, semverCondition)
    : true;
};

module.exports.getPackageVersion = function getPackageVersion(pkgName) {
  const json = getPackageJson(pkgName);

  return json !== void 0
    ? json.version
    : void 0;
};

module.exports.requireFromApp = (module) => require(resolve.appNodeModule(module));
