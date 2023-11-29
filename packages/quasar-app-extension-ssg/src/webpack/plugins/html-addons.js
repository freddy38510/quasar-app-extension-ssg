const { getHooks } = require('html-webpack-plugin');

function makeTag(tagName, attributes, closeTag = false) {
  return {
    tagName,
    attributes,
    closeTag,
  };
}

function makeScriptTag(innerHTML) {
  return {
    tagName: 'script',
    closeTag: true,
    innerHTML,
  };
}

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

        if (this.cfg.__vueDevtools !== false) {
          const { host, port } = this.cfg.__vueDevtools;
          data.headTags.push(
            makeScriptTag(`window.__VUE_DEVTOOLS_HOST__ = '${host}';window.__VUE_DEVTOOLS_PORT__ = '${port}';`),
            makeTag('script', { src: `http://${host}:${port}` }, true),
          );
        }

        return data;
      });
    });
  }
};
