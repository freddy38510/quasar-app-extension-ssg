const semverSatisfies = require('semver/functions/satisfies');

module.exports = function isCompatible(api, pkg, semverCondition) {
  return semverSatisfies(api.getPackageVersion(pkg), semverCondition);
};
