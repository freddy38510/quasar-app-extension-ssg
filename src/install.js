/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
module.exports = function (api) {
  api.compatibleWith('quasar', '^1.8.3')

  api.compatibleWith('@quasar/app', '^1.5.2')

  api.render('./templates', {})

  api.onExitLog('You can now add routes to generate by editing "src-ssg/routes.js" then run "quasar ssg build"')
}
