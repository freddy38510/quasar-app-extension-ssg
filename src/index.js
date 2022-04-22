/* eslint-disable global-require */
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function run(api) {
  api.compatibleWith('quasar', '^1.7.1');

  api.compatibleWith('@quasar/app', '^1.5.0||^2.0.0');

  api.registerCommand('generate', () => require('./bin/ssg-generate'));

  api.registerCommand('inspect', () => require('./bin/inspect'));

  api.registerCommand('serve', () => require('./bin/server'));
};
