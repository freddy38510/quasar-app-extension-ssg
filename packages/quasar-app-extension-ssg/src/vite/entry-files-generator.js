const { resolve, join, basename } = require('path');
const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  lstatSync,
} = require('fs');
const { removeSync } = require('fs-extra');
const compileTemplate = require('lodash/template');
const appPaths = require('@quasar/app-vite/lib/app-paths');

const quasarFolder = appPaths.resolve.app('.quasar');

class EntryFilesGenerator {
  #files;

  constructor() {
    const filePaths = [
      resolve(__dirname, './entry/app.js'),
      resolve(__dirname, './entry/client-entry.js'),
      resolve(__dirname, './entry/client-prefetch.js'),
      require.resolve('@quasar/app-vite/templates/entry/quasar-user-options.js'),
      resolve(__dirname, './entry/server-entry.js'),
    ];

    this.#files = filePaths.map((filePath) => {
      const content = readFileSync(
        filePath,
        'utf-8',
      );

      const filename = basename(filePath);

      return {
        filename,
        dest: join(quasarFolder, filename),
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
