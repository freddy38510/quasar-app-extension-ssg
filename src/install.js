/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
module.exports = function install(api) {
  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
    api.compatibleWith('quasar', '>= 2.6.0');
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

  let generateCommand = '$ quasar ssg generate';
  let devCommand = '$ quasar ssg dev';

  if (api.prompts.scripts) {
    generateCommand = '$ yarn build:ssg';
    devCommand = '$ yarn dev:ssg';

    api.extendPackageJson({
      scripts: {
        'build:ssg': 'quasar ssg generate',
        'dev:ssg': 'quasar ssg dev',
        'serve:ssg': 'quasar ssg serve dist/ssg',
      },
    });
  }

  api.onExitLog(`See https://github.com/freddy38510/quasar-app-extension-ssg/#configuration to configure the extension then run "${generateCommand}" or "${devCommand}`);
};
