/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const { hasPackage } = require('../../../helpers/packages');
const requireFromApp = require('../../../helpers/require-from-app');

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

module.exports.getIndexHtml = function getIndexHtml(template, cfg) {
  const compileTemplate = requireFromApp('lodash.template');
  const HtmlWebpackPlugin = requireFromApp('html-webpack-plugin');

  const { fillBaseTag } = requireFromApp('@quasar/app/lib/webpack/plugin.html-addons');
  // eslint-disable-next-line global-require
  const { fillPwaTags } = require('../pwa/plugin.html-pwa');

  const compiled = compileTemplate(
    template.replace('<div id="q-app"></div>', '<!--vue-ssr-outlet-->'),
  );

  const opts = hasPackage('@quasar/app', '>= 2.0.0') ? cfg.htmlVariables : {
    htmlWebpackPlugin: {
      options: cfg.__html.variables,
    },
  };

  let html = compiled(opts);

  const data = { bodyTags: [], headTags: [] };

  if (cfg.ctx.mode.pwa) {
    fillPwaTags(data, cfg, HtmlWebpackPlugin.createHtmlTagObject);
  }

  if (data.bodyTags.length > 0 || data.headTags.length > 0) {
    const htmlCtx = { options: { xhtml: false } };

    if (hasPackage('@quasar/app', '>= 2.0.0')) {
      html = HtmlWebpackPlugin.prototype.injectAssetsIntoHtml.call(htmlCtx, html, {}, data);
    } else {
      htmlCtx.createHtmlTag = HtmlWebpackPlugin.prototype.createHtmlTag;

      html = HtmlWebpackPlugin.prototype.injectAssetsIntoHtml.call(
        htmlCtx,
        html,
        {},
        { body: data.bodyTags, head: data.headTags },
      );
    }
  }

  html = injectSsrInterpolation(html);

  if (cfg.build.appBase) {
    html = fillBaseTag(html, cfg.build.appBase);
  }

  /*
  if (cfg.build.minify) {
    const { minify } = requireFromApp('html-minifier');
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
