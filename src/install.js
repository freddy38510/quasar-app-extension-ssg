/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { peerDependencies } = require('../package.json');

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

  if (api.prompts.IDE) {
    api.renderFile(
      `./${api.hasVite ? 'vite' : 'webpack'}/types/quasar-wrappers.d.ts`,
      'src/ssg.d.ts',
      api.hasVite ? {} : {
        quasarAppPkgName: '@quasar/app-webpack',
      },
    );
  }

  const depsToInstall = !api.hasVite ? [
    '@freddy38510/vue-loader',
    '@freddy38510/vue-style-loader',
  ] : ['@rollup/plugin-node-resolve'];

  Object.keys(peerDependencies).forEach((peerDepName) => {
    if (!depsToInstall.includes(peerDepName)) {
      delete peerDependencies[peerDepName];
    }
  });

  if (Object.keys(peerDependencies).length > 0) {
    const { requireFromApp } = require(`./${api.hasVite ? 'vite' : 'webpack'}/helpers/packages`);

    const nodePackager = requireFromApp(`@quasar/app-${api.hasVite ? 'vite' : 'webpack'}/lib/helpers/node-packager`);

    nodePackager.installPackage(
      Object.entries(peerDependencies).map(([name, version]) => `${name}@${version}`),
      { isDev: true, displayName: 'SSG dependencies' },
    );
  }

  api.renderFile('./ssg-flag.d.ts', 'src/ssg-flag.d.ts'); // feature flag

  api.onExitLog(
    `See https://github.com/freddy38510/quasar-app-extension-ssg/#configuration to configure the extension then run "${generateCommand}" or "${devCommand}`,
  );
};
