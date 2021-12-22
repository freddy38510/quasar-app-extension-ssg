const appRequire = require('../helpers/app-require');

function injectSsrInterpolation(html) {
  return html
    .replace(
      /(<html[^>]*)(>)/i,
      (found, start, end) => {
        let matches;

        matches = found.match(/\sdir\s*=\s*['"]([^'"]*)['"]/i);
        if (matches) {
          start = start.replace(matches[0], '');
        }

        matches = found.match(/\slang\s*=\s*['"]([^'"]*)['"]/i);
        if (matches) {
          start = start.replace(matches[0], '');
        }

        return `${start} {{ Q_HTML_ATTRS }}${end}`;
      },
    )
    .replace(
      /(<head[^>]*)(>)/i,
      (_, start, end) => `${start}${end}{{ Q_HEAD_TAGS }}`,
    )
    .replace(
      /(<body[^>]*)(>)/i,
      (found, start, end) => {
        let classes = '{{ Q_BODY_CLASSES }}';

        const matches = found.match(/\sclass\s*=\s*['"]([^'"]*)['"]/i);

        if (matches) {
          if (matches[1].length > 0) {
            classes += ` ${matches[1]}`;
          }
          start = start.replace(matches[0], '');
        }

        return `${start} class="${classes.trim()}" {{ Q_BODY_ATTRS }}${end}{{ Q_BODY_TAGS }}`;
      },
    );
}

module.exports.getIndexHtml = function getIndexHtml(api, template, cfg) {
  const compileTemplate = appRequire('lodash.template', api.appDir);
  const HtmlWebpackPlugin = appRequire('html-webpack-plugin', api.appDir);

  const { fillBaseTag } = appRequire('@quasar/app/lib/webpack/plugin.html-addons', api.appDir);
  // eslint-disable-next-line global-require
  const { fillPwaTags } = require('./plugin.html-pwa');

  const compiled = compileTemplate(
    template.replace('<div id="q-app"></div>', '<!--vue-ssr-outlet-->'),
  );

  let html = compiled(cfg.htmlVariables);

  const data = { bodyTags: [], headTags: [] };

  if (cfg.ctx.mode.pwa) {
    fillPwaTags(data, cfg, HtmlWebpackPlugin.createHtmlTagObject);
  }

  if (data.bodyTags.length > 0 || data.headTags.length > 0) {
    const htmlCtx = { options: { xhtml: false } };
    html = HtmlWebpackPlugin.prototype.injectAssetsIntoHtml.call(htmlCtx, html, {}, data);
  }

  html = injectSsrInterpolation(html);

  if (cfg.build.appBase) {
    html = fillBaseTag(html, cfg.build.appBase);
  }

  /*
  if (cfg.build.minify) {
    const { minify } = appRequire('html-minifier', api.appDir);
    html = minify(html, {
      // eslint-disable-next-line no-underscore-dangle
      ...cfg.__html.minifyOptions,
      ignoreCustomComments: [/vue-ssr-outlet/],
      ignoreCustomFragments: [/{{ [\s\S]*? }}/],
    });
  }
  */

  return html;
};
