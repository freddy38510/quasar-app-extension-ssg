/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/**
 * Quasar App Extension uninstall script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/uninstall-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/UninstallAPI.js
 */

module.exports = async function uninstall(api) {
  const appPaths = require(api.hasVite ? './vite/app-paths' : './webpack/helpers/app-paths');
  const { requireFromApp } = require(`./${api.hasVite ? 'vite' : 'webpack'}/helpers/packages`);

  api.removePath('src/ssg-flag.d.ts');

  if (api.prompts.IDE) {
    api.removePath('src/ssg.d.ts');
  }

  const { devDependencies } = require(appPaths.resolve.app('package.json'));

  const depsToUninstall = (!api.hasVite ? [
    '@freddy38510/vue-loader',
    '@freddy38510/vue-style-loader',
  ] : ['@rollup/plugin-node-resolve'])
    .filter((dep) => Object.keys(devDependencies).includes(dep));

  if (depsToUninstall.length === 0) {
    return;
  }

  const nodePackager = requireFromApp(`@quasar/app-${api.hasVite ? 'vite' : 'webpack'}/lib/helpers/node-packager`);

  nodePackager.uninstallPackage(depsToUninstall, {
    displayName: 'SSG dependencies',
  });
};
