/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function run(api) {
  api.compatibleWith('quasar', '^2.0.0');

  api.compatibleWith('@quasar/app', '^3.0.0');

  api.registerCommand('generate', () => require('./cmd/ssg-generate'));


  api.registerCommand('inspect', () => require('./cmd/inspect'));

  api.registerCommand('serve', () => require('./cmd/serve'));
};
