/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const path = require('path');
const requireFromApp = require('../helpers/require-from-app');

const compileTemplate = requireFromApp('lodash.template');
const appPaths = requireFromApp('@quasar/app/lib/app-paths');
const QuasarGenerator = requireFromApp('@quasar/app/lib/generator');

const quasarFolder = appPaths.resolve.app('.quasar');

class Generator extends QuasarGenerator {
  constructor(quasarConfFile) {
    super(quasarConfFile);

    const paths = [
      'ssg-renderer-entry.js',
    ];

    const newFiles = paths.map((file) => {
      const content = fs.readFileSync(
        path.resolve(__dirname, `./templates/entry/${file}`),
        'utf-8',
      );

      const filename = path.basename(file);

      return {
        filename,
        dest: path.join(quasarFolder, filename),
        template: compileTemplate(content),
        dataFn: (quasarConf) => ({
          opts: quasarConf.ssr.__templateOpts,
          flags: quasarConf.ssr.__templateFlags,
        }),
      };
    });

    this.files = [
      ...this.files.filter(({ filename }) => [
        'app.js',
        'client-entry.js',
        'client-prefetch.js',
        'import-quasar.js',
        'server-entry.js',
        'ssr-pwa.js',
      ].includes(filename)),
      ...newFiles,
    ];
  }
}

module.exports = Generator;
