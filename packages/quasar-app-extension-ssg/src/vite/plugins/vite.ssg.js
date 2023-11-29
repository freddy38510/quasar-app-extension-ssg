const { join, relative } = require('path');
const MagicString = require('magic-string');
const { normalizePath } = require('vite');
const getHash = require('../helpers/get-hash');
const parseViteRequest = require('../helpers/parse-vite-request');

/**
 * In production at server-side,
 * injects code into a component's setup() that registers itself on ssrContext
 *
 * After the render, ssrContext._lazilyHydratedComponents would contain all the
 * lazily hydrated components that have been instantiated during this render call.
 *
 * In this way, it is possible to avoid preloading these components in production.
 *
 * @type { () => import('vite').Plugin }
 */
function getLazyHydrationPlugin() {
  let root;

  const setupRE = /setup.*\(.*\).*{/i;

  const importName = '__quasar_ssg_vue3_lazy_hydration';
  const importCode = `import ${importName} from 'quasar-app-extension-ssg/src/vite/runtime.server.vue3-lazy-hydration';\n`;

  function generateCode(code, filename) {
    return (
      importCode
      + code.replace(setupRE, (match) => [match, `${importName}(${JSON.stringify(filename)});`].join('\n'))
    );
  }

  return {
    name: 'quasar-ssg:vue3-lazy-hydration',
    configResolved(config) {
      root = config.root;
    },

    transform(code, id) {
      const { is, filename } = parseViteRequest(id);

      if (is.script() && setupRE.test(code)) {
        const magicString = new MagicString(
          generateCode(code, normalizePath(relative(root, filename))),
        );

        return {
          code: magicString.toString(),
          map: magicString.generateMap(),
        };
      }

      return null;
    },
  };
}

/**
 * In development at client-side right after Vite injects the style,
 * remove the corresponding style injected by the server (initially to avoid FOUC)
 * to avoid duplicated styles.
 *
 * @type { () => import('vite').Plugin }
 */
function getRemoveSSRStylesPlugin() {
  const updateStyleRE = /__vite__updateStyle\(.*\)/;

  function generateCode(code, id) {
    return code.replace(updateStyleRE, (match) => [
      match,
      `const __ssg__el = document.querySelector('style[ssr-id=${JSON.stringify(
        getHash(id),
      )}]');`,
      'if (__ssg__el) { __ssg__el.remove(); }',
    ].join('\n'));
  }

  return {
    name: 'quasar-ssg:client-remove-ssr-styles',
    enforce: 'post',

    transform(code, id) {
      const { is } = parseViteRequest(id);

      if (is.style() && updateStyleRE.test(code)) {
        const magicString = new MagicString(generateCode(code, id));

        return {
          code: magicString.toString(),
          map: magicString.generateMap(),
        };
      }

      return null;
    },
  };
}

/**
 * In development at server-side export missing css of Vue SFC css modules.
 *
 * This way the css can be collected and injected in the head tag
 * to avoid FOUC.
 *
 * @type { () => import('vite').Plugin }
 */
function getCSSModulesPlugin() {
  const importName = '__module_css';

  function generateCode(code, id) {
    return [
      `export * as ${importName} from ${JSON.stringify(
        id.replace('type=style', 'type=style&inline'),
      )}`,
      code,
    ].join('\n');
  }

  return {
    name: 'quasar-ssg:ssr-vue-css-modules',
    enforce: 'post',

    transform(code, id, opts) {
      if (!opts.ssr) {
        return null;
      }

      const { is, query } = parseViteRequest(id);

      if (
        query.inline === void 0
        && is.vue()
        && is.cssModule()
      ) {
        const magicString = new MagicString(generateCode(code, id));

        return {
          code: magicString.toString(),
          map: magicString.generateMap(),
        };
      }

      return null;
    },
  };
}

/**
 * Replace the roboto font from @quasar/extras with its woff2 variant and
 * add font-display css descriptor to each font.
 *
 * Non-latin fonts are removed to prevent small ones from being inlined to the css chunk.
 *
 * The browser downloads latin and/or latin-ext fonts depending on the characters used in the page.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range
 *
 * @type { (fontDisplayValue: FontFaceDescriptors['display']) => import('vite').Plugin }
 */
function getRobotoFontPlugin(fontDisplayValue) {
  const quasarRobotoCssRE = /@quasar\/extras\/roboto-font.*\.css$/;
  const fontFaceRE = /@font-face\s*{/gi;
  const latinExtRE = /\/\* latin-ext \*\//i;

  const resolvedId = require.resolve('quasar-app-extension-ssg/roboto-font.css');

  function generateCode(code, idx) {
    return (
      code
        // remove non latin fonts
        .substring(idx)
        // add font-display property
        .replace(fontFaceRE, (match) => [match, `  font-display: ${fontDisplayValue};`].join('\n'))
    );
  }

  return {
    name: 'quasar-ssg:roboto-font',
    enforce: 'pre',
    resolveId(id) {
      if (quasarRobotoCssRE.test(id)) {
        // replace the roboto font from @quasar/extras with its woff2 variant
        return resolvedId;
      }

      return null;
    },
    transform(code, id) {
      if (id === resolvedId) {
        const idx = code.search(latinExtRE);

        if (idx === -1) {
          return null;
        }

        const magicString = new MagicString(generateCode(code, idx));

        return {
          code: magicString.toString(),
          map: magicString.generateMap(),
        };
      }

      return null;
    },
  };
}

/**
 * Auto import svg icons from @quasar/extras package.
 *
 * For better performance only icons from the configured Quasar Icon Set are auto imported.
 * @see https://quasar.dev/vue-components/icon#svg-usage
 *
 * @type { (iconSet: import('quasar').QuasarIconSets) => import('vite').Plugin }
 */
function getAutoImportSvgIconsPlugin(iconSet) {
  if (!iconSet || !iconSet.startsWith('svg')) {
    return null;
  }

  const { default: autoImportPlugin } = require('unplugin-auto-import/vite');

  const idx = 'svg-'.length;
  const iconSetPath = `@quasar/extras/${iconSet.substring(idx)}`;

  return autoImportPlugin({
    imports: [
      { [iconSetPath]: require(join(iconSetPath, 'icons.json')) },
    ],
    vueTemplate: true,
    dts: false,
  });
}

module.exports.plugin = function QuasarSSGVitePlugin(quasarConf, runMode) {
  const plugins = [
    getRobotoFontPlugin(quasarConf.ssg.robotoFontDisplay),
  ];

  if (quasarConf.ssg.autoImportSvgIcons !== false) {
    plugins.push(getAutoImportSvgIconsPlugin(quasarConf.framework.iconSet));
  }

  if (quasarConf.ctx.dev) {
    if (runMode === 'ssr-server') {
      plugins.push(getCSSModulesPlugin());
    }

    if (runMode === 'ssr-client') {
      plugins.push(getRemoveSSRStylesPlugin());
    }
  } else if (runMode === 'ssr-server') {
    plugins.push(getLazyHydrationPlugin());
  }

  return plugins;
};
