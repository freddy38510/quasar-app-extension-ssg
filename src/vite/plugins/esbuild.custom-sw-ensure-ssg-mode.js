/**
 * By default Quasar custom-service-worker.js template file use process.env.MODE
 * to conditionnaly fallback to offline.html in production only
 *
 * Ensure to not fallback to offline.html in dev with SSG mode
 */

const { readFileSync } = require('fs');
const { extname } = require('path');

module.exports = function customSWVitePlugin(quasarConf) {
  return {
    name: 'quasar:ssg-custom-sw-ensure-ssg-mode',

    setup(build) {
      build.onLoad(
        { filter: new RegExp(quasarConf.sourceFiles.pwaServiceWorker) },
        () => ({
          contents: readFileSync(
            quasarConf.sourceFiles.pwaServiceWorker,
            'utf-8',
          ).replace(
            "process.env.MODE !== 'ssr'",
            "process.env.MODE !== 'ssg'",
          ),
          loader: extname(quasarConf.sourceFiles.pwaServiceWorker).slice(1),
        }),
      );
    },
  };
};
