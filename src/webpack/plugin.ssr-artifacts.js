const fs = require('fs').promises;
const { getIndexHtml } = require('./html-template');
const appRequire = require('../helpers/app-require');

module.exports = class SsrProdArtifacts {
  constructor(cfg = {}, api) {
    this.cfg = cfg;
    this.api = api;
  }

  apply(compiler) {
    const { sources, Compilation } = appRequire('webpack', this.api.appDir);

    compiler.hooks.thisCompilation.tap('ssr-artifacts', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        { name: 'ssr-artifacts', state: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, async () => {
          const htmlTemplate = await this.getHtmlTemplate();
          const content = new sources.RawSource(htmlTemplate);

          compilation.emitAsset('../render-template.js', content);
        },
      );
    });
  }

  async getHtmlTemplate() {
    const htmlFile = this.api.resolve.app(this.cfg.sourceFiles.indexHtmlTemplate);
    const renderTemplate = getIndexHtml(this.api, await fs.readFile(htmlFile, 'utf-8'), this.cfg);

    return `module.exports=${renderTemplate.source}`;
  }
};
