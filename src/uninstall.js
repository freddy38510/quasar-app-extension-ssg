/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/**
 * Quasar App Extension uninstall script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/uninstall-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/UninstallAPI.js
 */

const { requireFromApp, engine, ssgDeps } = require('./api');

module.exports = async function uninstall(api) {
  api.removePath('src/ssg-flag.d.ts');

  if (ssgDeps.length === 0) {
    return;
  }

  const appPaths = requireFromApp(`${engine}/lib/app-paths`);

  const { devDependencies } = require(appPaths.resolve.app('package.json'));

  const depsToUninstall = ssgDeps.filter((dep) => Object.keys(devDependencies).includes(dep));

  if (depsToUninstall.length === 0) {
    return;
  }

  const nodePackager = requireFromApp(`${engine}/lib/helpers/node-packager`);

  nodePackager.uninstallPackage(depsToUninstall, {
    displayName: 'SSG dependencies',
  });
};
