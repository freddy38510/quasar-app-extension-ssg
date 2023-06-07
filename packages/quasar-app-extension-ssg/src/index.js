/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */
module.exports = function run(api) {
  api.compatibleWith('quasar', '>= 2.6.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
  } else {
    api.compatibleWith('@quasar/app-webpack', '>= 3.7.0');
  }

  const basePath = `./${api.hasVite ? 'vite' : 'webpack'}/cmd/`;

  api.registerCommand('generate', () => {
    require(`${basePath}generate`);
  });

  api.registerCommand('dev', () => {
    require(`${basePath}dev`);
  });

  api.registerCommand('inspect', () => {
    require(`${basePath}inspect`);
  });

  api.registerCommand('serve', () => {
    require('./cmd/serve');
  });
};
