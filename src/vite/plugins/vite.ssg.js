/* eslint-disable no-underscore-dangle */

const path = require('path');
const { default: MagicString } = require('magic-string');
const { requireFromApp } = require('../helpers/packages');
const getHash = require('../helpers/get-hash');

const { normalizePath } = requireFromApp('vite');

const cssLangs = '\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)';
const cssLangRE = new RegExp(cssLangs);

/**
 * In production at server-side,
 * injects code into a component's setup() that registers itself on ssrContext
 *
 * After the render, ssrContext._lazilyHydratedComponents would contain all the
 * lazily hydrated components that have been instantiated during this render call.
 *
 * In this way, it is possible to avoid preloading these components in production.
 */
function getLazyHydrationPlugin() {
  let root;

  const jsTransformRegex = /\.[jt]sx?$/;
  const vueTransformRegex = /\.vue(?:\?vue&type=(?:template|script)(?:&setup=true)?&lang\.(?:j|t)s)?$/;
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
      if (
        (vueTransformRegex.test(id)
          || jsTransformRegex.test(id))
        && setupRE.test(code)
      ) {
        const [filename] = id.split('?', 2);

        const magicString = new MagicString(
          generateCode(code, normalizePath(path.relative(root, filename))),
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
 * remove the corresponding style injected by the server (initially to avoid FOUC).
 */
function getRemoveSSRStylesPlugin() {
  const updateStyleRE = /__vite__updateStyle\(.*\)/;

  function generateCode(code, id) {
    return code.replace(updateStyleRE, (match) => [
      match,
      `const __ssg__el = document.querySelector('style[ssr-id=${JSON.stringify(getHash(
        id,
      ))}]');`,
      'if (__ssg__el) { __ssg__el.remove(); }',
    ].join('\n'));
  }

  return {
    name: 'quasar-ssg:client-remove-ssr-styles',
    enforce: 'post',

    transform(code, id) {
      if (cssLangRE.test(id) && updateStyleRE.test(code)) {
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
 */
function getCSSModulesPlugin() {
  const cssModuleRE = new RegExp(`\\.module${cssLangs}`);
  const inlineRE = /(\?|&)inline\b/;

  const importName = '__module_css';

  function generateCode(code, id) {
    return [
      `export * as ${importName} from ${JSON.stringify(id.replace('vue&type=style', 'vue&type=style&inline'))}`,
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

      if (cssModuleRE.test(id) && id.includes('vue&type=style') && !inlineRE.test(id)) {
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

module.exports.cssLangRE = cssLangRE;

module.exports.plugin = function QuasarSSGVitePlugin(runMode, isDev) {
  const plugins = [];

  if (isDev) {
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
