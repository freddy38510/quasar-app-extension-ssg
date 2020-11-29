const semverSatisfies = require('semver/functions/satisfies')

module.exports = (api, pkg, semverCondition) => semverSatisfies(api.getPackageVersion(pkg), semverCondition)
