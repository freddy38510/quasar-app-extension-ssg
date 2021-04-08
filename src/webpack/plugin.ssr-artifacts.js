const fs = require('fs');
const appRequire = require('../helpers/app-require');

module.exports = class SsrProdArtifacts {
  constructor(cfg = {}, api) {
    this.cfg = cfg;
    this.api = api;
  }

  apply(compiler) {
    const { getIndexHtml } = appRequire('@quasar/app/lib/ssr/html-template', this.api.appDir);

    // eslint-disable-next-line no-shadow
    compiler.hooks.emit.tapAsync('ssr-artifacts', (compiler, callback) => {
      /*
      * /template.html
      */
      const htmlFile = this.api.resolve.app(this.cfg.sourceFiles.indexHtmlTemplate);
      const htmlTemplate = getIndexHtml(fs.readFileSync(htmlFile, 'utf-8'), this.cfg);

      compiler.assets['../template.html'] = {
        source: () => Buffer.from(htmlTemplate, 'utf8'),
        size: () => Buffer.byteLength(htmlTemplate),
      };

      /*
      * /ssr-config.js
      */
      const ssrConfigFile = this.api.resolve.app('.quasar/ssr-config.js');
      const ssrConfig = fs.readFileSync(ssrConfigFile, 'utf-8');

      compiler.assets['../ssr-config.js'] = {
        source: () => Buffer.from(ssrConfig, 'utf8'),
        size: () => Buffer.byteLength(ssrConfig),
      };

      callback();
    });
  }
};
