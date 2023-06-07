const { getHooks } = require('html-webpack-plugin');

function fillBaseTag(html, base) {
  return html.replace(
    /(<head[^>]*)(>)/i,
    (_, start, end) => `${start}${end}<base href="${base}">`,
  );
}

module.exports.fillBaseTag = fillBaseTag;

module.exports.plugin = class HtmlAddonsPlugin {
  constructor(cfg = {}) {
    this.cfg = cfg;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('webpack-plugin-html-addons', (compilation) => {
      const hooks = getHooks(compilation);

      hooks.afterTemplateExecution.tapPromise('webpack-plugin-html-addons', async (data) => {
        if (this.cfg.build.appBase) {
          data.html = fillBaseTag(data.html, this.cfg.build.appBase);
        }

        return data;
      });
    });
  }
};
