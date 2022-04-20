const fs = require('fs').promises;
const { getIndexHtml } = require('./html-template');
const { resolve } = require('../../../helpers/app-paths');

module.exports = class SsrProdArtifacts {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise('renderer-template-plugin', async (compilation) => {
      /*
      * /template.html
      */
      const htmlTemplatePath = resolve.app(this.cfg.sourceFiles.indexHtmlTemplate);
      const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf-8');
      // use a custom getIndexHtml function to avoid malformed HTML when pwa is enabled
      const htmlTemplateCompiled = getIndexHtml(htmlTemplate, this.cfg);

      compilation.assets['template.html'] = {
        source: () => Buffer.from(htmlTemplateCompiled, 'utf8'),
        size: () => Buffer.byteLength(htmlTemplateCompiled),
      };
    });
  }
};
