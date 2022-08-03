const {
  existsSync, mkdirSync, readFileSync, writeFileSync, lstatSync,
} = require('fs');
const path = require('path');
const { requireFromApp } = require('./helpers/packages');

const { removeSync } = requireFromApp('fs-extra');
const compileTemplate = requireFromApp('lodash/template');

const appPaths = require('./app-paths');

const quasarFolder = appPaths.resolve.app('.quasar');

class EntryFilesGenerator {
  #files;

  constructor() {
    const filePaths = [
      path.resolve(__dirname, './entry/app.js'),
      path.resolve(__dirname, './entry/client-entry.js'),
      path.resolve(__dirname, './entry/client-prefetch.js'),
      appPaths.resolve.appNodeModule('@quasar/app-vite/templates/entry/quasar-user-options.js'),
      path.resolve(__dirname, './entry/server-entry.js'),
    ];

    this.#files = filePaths.map((filePath) => {
      const content = readFileSync(
        filePath,
        'utf-8',
      );

      const filename = path.basename(filePath);

      return {
        filename,
        dest: path.join(quasarFolder, filename),
        template: compileTemplate(content),
      };
    });
  }

  generate(quasarConf) {
    // ensure .quasar folder
    if (!existsSync(quasarFolder)) {
      mkdirSync(quasarFolder);
    } else if (!lstatSync(quasarFolder).isDirectory()) {
      removeSync(quasarFolder);
      mkdirSync(quasarFolder);
    }

    this.#files.forEach((file) => {
      writeFileSync(file.dest, file.template(quasarConf), 'utf-8');
    });
  }
}

module.exports = () => new EntryFilesGenerator();
