/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const fs = require('fs');
const { resolve } = require('path');

const { log } = require('./logger');
const { requireFromApp } = require('./packages');

const fse = requireFromApp('fs-extra');
const appPaths = requireFromApp('@quasar/app-vite/lib/app-paths');

function getStoreFlagPath(storeIndexPath) {
  return path.join(path.parse(storeIndexPath).dir, 'store-flag.d.ts');
}

function isInstalled(mode) {
  if (mode === 'ssg') {
    return true;
  }

  const quasarMode = requireFromApp(`@quasar/app-vite/lib/modes/${mode}/${mode}-installation`);

  return quasarMode.isInstalled();
}

module.exports = function regenerateTypesFeatureFlags(quasarConf) {
  // Flags must be available even in pure JS codebases,
  //    because boot and configure wrappers functions files will
  //    provide autocomplete based on them also to JS users
  // Flags files should be copied over, for every enabled mode,
  //    every time `quasar ssg dev` and `quasar ssg generate` are run:
  //    this automatize the upgrade for existing codebases
  [
    'pwa',
    'cordova',
    'capacitor',
    'ssr',
    'store',
    'bex',
    'ssg',
  ].forEach((feature) => {
    const [isFeatureInstalled, sourceFlagPath, destFlagPath] = feature === 'store'
      ? [
        quasarConf.store,
        appPaths.resolve.cli('templates/store/store-flag.d.ts'),
        appPaths.resolve.app(getStoreFlagPath(quasarConf.sourceFiles.store)),
      ]
      : [
        isInstalled(feature),
        feature === 'ssg' ? resolve(__dirname, '../../ssg-flag.d.ts') : appPaths.resolve.cli(`templates/${feature}/${feature}-flag.d.ts`),
        feature === 'ssg' ? appPaths.resolve.src('ssg-flag.d.ts') : appPaths.resolve[feature](`${feature}-flag.d.ts`),
      ];

    if (isFeatureInstalled && !fs.existsSync(destFlagPath)) {
      fse.copySync(sourceFlagPath, destFlagPath);
      log(`'${feature}' feature flag was missing and has been regenerated`);
    }
  });
};
