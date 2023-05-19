const fs = require('fs');
const { getIndexHtml } = require('../../renderer/html-template');
const { requireFromApp } = require('../../../api');

const appPaths = requireFromApp('@quasar/app-webpack/lib/app-paths');

module.exports = class RenderTemplatePlugin {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    const { sources, Compilation } = requireFromApp('webpack');

    compiler.hooks.thisCompilation.tap('render-template', (compilation) => {
      compilation.hooks.processAssets.tapPromise({ name: 'render-template', state: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, async () => {
        if (this.cfg.ctx.dev) {
          compilation.fileDependencies.add(
            appPaths.resolve.app(this.cfg.sourceFiles.indexHtmlTemplate),
          );
        }

        compilation.emitAsset('render-template.js', new sources.RawSource(this.getHtmlTemplate()));
      });
    });
  }

  getHtmlTemplate() {
    const htmlFile = appPaths.resolve.app(this.cfg.sourceFiles.indexHtmlTemplate);
    const renderTemplate = getIndexHtml(fs.readFileSync(htmlFile, 'utf-8'), this.cfg);

    return `module.exports=${renderTemplate.source}`;
  }
};
