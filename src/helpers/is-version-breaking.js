const semverGte = require('semver/functions/gte')

module.exports = (api) => {
  return semverGte(api.getPackageVersion('@quasar/app'), '2.1.0')
}
