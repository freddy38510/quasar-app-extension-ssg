const semverSatisfies = require('semver/functions/satisfies');

const isCompatible = function isCompatible(api, pkg, semverCondition) {
  return semverSatisfies(api.getPackageVersion(pkg), semverCondition);
};

const hasNewQuasarConfFile = function hasNewQuasarConfFile(api) {
  return isCompatible(api, '@quasar/app', '>=2.0.1');
};

const hasBrowsersSupportFile = function hasBrowsersSupportFile(api) {
  return isCompatible(api, '@quasar/app', '>=2.0.0');
};

module.exports = {
  isCompatible,
  hasNewQuasarConfFile,
  hasBrowsersSupportFile,
};
