/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
module.exports = function install(api) {
  api.compatibleWith('quasar', '^1.7.1');

  api.compatibleWith('@quasar/app', '^1.5.0||^2.0.0');

  let command = '$ quasar ssg generate';

  if (api.prompts.scripts) {
    command = '$ yarn build:ssg';

    api.extendPackageJson({
      scripts: {
        'build:ssg': 'quasar ssg generate',
        'serve:ssg': 'quasar ssg serve dist/ssg',
      },
    });
  }

  api.onExitLog(`See https://github.com/freddy38510/quasar-app-extension-ssg/#configuration to configure the extension then run "${command}"`);
};
