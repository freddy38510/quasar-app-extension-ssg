const semver = require('semver');

const viteDeps = {
  current: [],
  previous: [
    '@rollup/plugin-node-resolve',
  ],
  pwa: [],
};

const webpackDeps = {
  current: [],
  previous: [
    '@freddy38510/vue-loader',
    '@freddy38510/vue-style-loader',
  ],
  pwa: [
    'workbox-build',
    'workbox-core',
    'workbox-routing',
    'workbox-strategies',
    'workbox-expiration',
    'workbox-precaching',
    'workbox-cacheable-response',
  ],
};

function getPackageJson(pkgName) {
  try {
    return require(`${pkgName}/package.json`);
  } catch (e) {
    if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      return {};
    }

    return void 0;
  }
}

module.exports.getPackageVersion = function getPackageVersion(pkgName) {
  const json = getPackageJson(pkgName);

  return json !== void 0
    ? json.version
    : void 0;
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

module.exports.hasVite = this.hasPackage('@quasar/app-vite');

module.exports.engine = `@quasar/app-${this.hasVite ? 'vite' : 'webpack'}`;

module.exports.ssgDeps = this.hasVite ? viteDeps : webpackDeps;
