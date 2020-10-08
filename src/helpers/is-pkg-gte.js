const semverGte = require('semver/functions/gte')

module.exports = (api, pkg, version) => {
  return semverGte(api.getPackageVersion(pkg), version)
}
