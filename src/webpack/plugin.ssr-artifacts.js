const fs = require('fs').promises;
const { getIndexHtml } = require('./html-template');

module.exports = class SsrProdArtifacts {
  constructor(cfg = {}, api) {
    this.cfg = cfg;
    this.api = api;
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise('ssr-artifacts', async (compilation) => {
      /*
      * /template.html
      */
      const htmlTemplatePath = this.api.resolve.app(this.cfg.sourceFiles.indexHtmlTemplate);
      const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf-8');
      // use a custom getIndexHtml function to avoid malformed HTML when pwa is enabled
      const htmlTemplateCompiled = getIndexHtml(this.api, htmlTemplate, this.cfg);

      compilation.assets['../template.html'] = {
        source: () => Buffer.from(htmlTemplateCompiled, 'utf8'),
        size: () => Buffer.byteLength(htmlTemplateCompiled),
      };

      /*
      * /ssr-config.js
      */
      const ssrConfigFilePath = this.api.resolve.app('.quasar/ssr-config.js');
      const ssrConfig = await fs.readFile(ssrConfigFilePath, 'utf-8');

      compilation.assets['../ssr-config.js'] = {
        source: () => Buffer.from(ssrConfig, 'utf8'),
        size: () => Buffer.byteLength(ssrConfig),
      };
    });
  }
};
