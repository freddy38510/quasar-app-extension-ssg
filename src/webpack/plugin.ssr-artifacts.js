const fs = require('fs').promises;
const { getIndexHtml } = require('./html-template');
const requireFromApp = require('../helpers/require-from-app');
const { resolve } = require('../helpers/app-paths');

module.exports = class SsrProdArtifacts {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    const { sources, Compilation } = requireFromApp('webpack');

    compiler.hooks.thisCompilation.tap('ssr-artifacts', (compilation) => {
      compilation.hooks.processAssets.tapPromise({ name: 'ssr-artifacts', state: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, async () => {
        const htmlTemplate = await this.getHtmlTemplate();
        const content = new sources.RawSource(htmlTemplate);

        compilation.emitAsset('../render-template.js', content);
      });
    });
  }

  async getHtmlTemplate() {
    const htmlFile = resolve.app(this.cfg.sourceFiles.indexHtmlTemplate);
    const renderTemplate = getIndexHtml(await fs.readFile(htmlFile, 'utf-8'), this.cfg);

    return `module.exports=${renderTemplate.source}`;
  }
};
