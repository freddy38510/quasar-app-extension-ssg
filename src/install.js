/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { requireFromApp, engine, ssgDeps } = require('./api');

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
    api.compatibleWith('vite', '>= 2.9.1');
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
      `./${api.hasVite ? 'vite' : 'webpack'}/types/quasar-wrappers.d.ts`,
      'src/ssg.d.ts',
      api.hasVite ? {} : {
        engine,
      },
    );
  }

  if (ssgDeps.length > 0) {
    const nodePackager = requireFromApp(`${engine}/lib/helpers/node-packager`);
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
