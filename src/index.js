/* eslint-disable global-require */
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function run(api) {
  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
    api.compatibleWith('quasar', '>= 2.6.0');
    api.compatibleWith('vite', '>= 2.9.1');
  } else {
    api.compatibleWith('quasar', '^2.0.0');

    if (api.hasPackage('@quasar/app-webpack')) {
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
  }

  api.registerCommand('generate', () => {
    if (api.hasVite) {
      require('./vite/cmd/generate');
    } else {
      require('./webpack/cmd/ssg-generate');
    }
  });

  api.registerCommand('dev', () => {
    if (api.hasVite) {
      require('./vite/cmd/dev');
    } else {
      require('./webpack/cmd/dev');
    }
  });

  api.registerCommand('inspect', () => {
    if (api.hasVite) {
      require('./vite/cmd/inspect');
    } else {
      require('./webpack/cmd/inspect');
    }
  });

  api.registerCommand('serve', () => {
    if (api.hasVite) {
      require('./vite/cmd/serve');
    } else {
      require('./webpack/cmd/serve');
    }
  });
};
