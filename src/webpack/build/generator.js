const fs = require('fs');
const path = require('path');
const { requireFromApp } = require('../helpers/packages');

const compileTemplate = requireFromApp('lodash/template');
const appPaths = requireFromApp('@quasar/app-webpack/lib/app-paths');
const QuasarGenerator = requireFromApp('@quasar/app-webpack/lib/generator');

const quasarFolder = appPaths.resolve.app('.quasar');

class Generator extends QuasarGenerator {
  constructor(quasarConfFile) {
    super(quasarConfFile);

    const paths = [
      // forked Quasar entries adding full SPA fallback support
      'app.js',
      'client-entry.js',
      'client-prefetch.js',
      // forked Quasar entry exporting routes from router
      'server-entry.js',
      // new entry for ssg
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
      };
    });

    this.files = [
      ...newFiles,
      ...this.files.filter(({ filename }) => [
        // keep only these Quasar entries
        'quasar-user-options.js',
      ].includes(filename)),
    ];
  }
}

module.exports = Generator;
