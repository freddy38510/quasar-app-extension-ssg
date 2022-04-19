const requireFromApp = require('../helpers/require-from-app');

function fillPwaTags(data, {
  pwa: {
    manifest, metaVariables, metaVariablesFn, useCredentials,
  },
}, createHtmlTagObject) {
  data.headTags.push(
    // Add to home screen for Android and modern mobile browsers
    createHtmlTagObject('link', {
      rel: 'manifest',
      href: 'manifest.json',
      ...(useCredentials ? { crossorigin: 'use-credentials' } : {}),
    }),
  );

  if (typeof metaVariablesFn === 'function') {
    const tags = metaVariablesFn(manifest);

    if (Array.isArray(tags)) {
      tags.forEach((tag) => {
        data.headTags.push(
          createHtmlTagObject(tag.tagName, tag.attributes),
        );
      });
    }
  } else {
    data.headTags.push(
      createHtmlTagObject('meta', {
        name: 'theme-color',
        content: manifest.theme_color,
      }),

      // Add to home screen for Safari on iOS
      createHtmlTagObject('meta', {
        name: 'apple-mobile-web-app-capable',
        content: metaVariables.appleMobileWebAppCapable,
      }),
      createHtmlTagObject('meta', {
        name: 'apple-mobile-web-app-status-bar-style',
        content: metaVariables.appleMobileWebAppStatusBarStyle,
      }),
      createHtmlTagObject('meta', {
        name: 'apple-mobile-web-app-title',
        content: manifest.name,
      }),
      createHtmlTagObject('link', {
        rel: 'apple-touch-icon',
        href: metaVariables.appleTouchIcon120,
      }),
      createHtmlTagObject('link', {
        rel: 'apple-touch-icon',
        sizes: '152x152',
        href: metaVariables.appleTouchIcon152,
      }),
      createHtmlTagObject('link', {
        rel: 'apple-touch-icon',
        sizes: '167x167',
        href: metaVariables.appleTouchIcon167,
      }),
      createHtmlTagObject('link', {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: metaVariables.appleTouchIcon180,
      }),
      createHtmlTagObject('link', {
        rel: 'mask-icon',
        href: metaVariables.appleSafariPinnedTab,
        color: manifest.theme_color,
      }),

      // Add to home screen for Windows
      createHtmlTagObject('meta', {
        name: 'msapplication-TileImage',
        content: metaVariables.msapplicationTileImage,
      }),
      createHtmlTagObject('meta', {
        name: 'msapplication-TileColor',
        content: metaVariables.msapplicationTileColor,
      }),
    );
  }
}

module.exports.fillPwaTags = fillPwaTags;

module.exports.plugin = class HtmlPwaPlugin {
  constructor(api, cfg = {}) {
    this.cfg = cfg;
    this.api = api;
  }

  apply(compiler) {
    const HtmlWebpackPlugin = requireFromApp('html-webpack-plugin', this.api.appDir);

    compiler.hooks.compilation.tap('webpack-plugin-html-pwa', (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.afterTemplateExecution.tapPromise('webpack-plugin-html-pwa', async (data) => {
        fillPwaTags(data, this.cfg, HtmlWebpackPlugin.createHtmlTagObject);

        // finally, inform Webpack that we're ready
        return data;
      });
    });
  }
};
