/* eslint-disable global-require */
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function run(api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (api.hasPackage('@quasar/app-webpack') || api.hasPackage('@quasar/app-vite')) {
    api.compatibleWith('@quasar/app-webpack', '^3.0.0');
  } else {
    api.compatibleWith('@quasar/app', '^3.0.0');
  }

  if (api.hasPackage('@quasar/app-webpack', '>= 3.4.0')) {
    api.compatibleWith('quasar', '>= 2.6.0');
  }

  if (api.hasPackage('quasar', '>= 2.6.0')) {
    api.compatibleWith('@quasar/app-webpack', '>= 3.4.0');
  }

  api.registerCommand('generate', () => require('./cmd/ssg-generate'));

  api.registerCommand('dev', () => require('./cmd/dev'));

  api.registerCommand('inspect', () => require('./cmd/inspect'));

  api.registerCommand('serve', () => require('./cmd/serve'));
};
