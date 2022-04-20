const { hasPackage } = require('./packages');

const hasNewQuasarConfFile = hasPackage('@quasar/app', '>=2.0.1');

const hasBrowsersSupportFile = hasPackage('@quasar/app', '>=2.0.0');

module.exports = {
  hasNewQuasarConfFile,
  hasBrowsersSupportFile,
};
