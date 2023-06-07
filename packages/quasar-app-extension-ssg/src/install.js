const { engine, ssgDeps } = require('./api');

/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
module.exports = function install(api) {
  api.compatibleWith('quasar', '>= 2.6.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
  } else {
    api.compatibleWith('@quasar/app-webpack', '>= 3.7.0');
  }

  if (api.prompts.scripts) {
    api.extendPackageJson({
      scripts: {
        'build:ssg': 'quasar ssg generate',
        'dev:ssg': 'quasar ssg dev',
        'serve:ssg': 'quasar ssg serve dist/ssg',
      },
    });
  }

  // feature flag
  api.renderFile('./ssg-flag.d.ts', 'src/ssg-flag.d.ts');

  // ssg config
  if (api.prompts.IDE) {
    api.renderFile(
      './ssg.d.ts',
      'src/ssg.d.ts',
      {
        engine: api.hasVite ? 'vite' : 'webpack',
      },
    );
  }

  let nodePackager;

  if (api.hasVite) {
    nodePackager = require('@quasar/app-vite/lib/helpers/node-packager');
  } else {
    nodePackager = require('@quasar/app-webpack/lib/helpers/node-packager');
  }

  if (ssgDeps.previous.length > 0) {
    const appPaths = require(`${engine}/lib/app-paths`);
    const appDevDependencies = Object.keys(require(appPaths.resolve.app('package.json')).devDependencies);

    const depsToUninstall = ssgDeps.previous
      .filter((dep) => appDevDependencies.includes(dep));

    if (depsToUninstall.length > 0) {
      nodePackager.uninstallPackage(depsToUninstall, { displayName: 'SSG dependencies no longer required', cwd: appPaths.appDir });
    }
  }

  if (ssgDeps.current.length > 0) {
    const { peerDependencies } = require('../package.json');

    nodePackager.installPackage(
      ssgDeps.map((name) => `${name}@${peerDependencies[name]}`),
      {
        isDevDependency: true, // new prop name
        isDev: true, // old prop name
        displayName: 'SSG dependencies',
      },
    );
  }

  const generateCommand = '$ quasar ssg generate';
  const devCommand = '$ quasar ssg dev';

  api.onExitLog(
    `See https://github.com/freddy38510/quasar-app-extension-ssg/#configuration to configure the extension then run "${generateCommand}" or "${devCommand}`,
  );
};
