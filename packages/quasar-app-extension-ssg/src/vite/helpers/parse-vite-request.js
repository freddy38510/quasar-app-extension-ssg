const vueExt = ['.vue'];
const scriptExt = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
const styleExt = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus', '.pcss', '.postcss'];
const cssModuleExt = styleExt.map((ext) => `.module${ext}`);

/**
 * @type {(
 * param: {
 *   extensions: string[],
 *   filename?: string,
 *   query?: { [key: string]: string; }
 * }) => boolean }
 */
const isOfExt = ({ extensions, filename, query }) => extensions.some(
  (ext) => filename?.endsWith(ext) || query?.[`lang${ext}`] !== void 0,
);

/**
 * @typedef {{
 *  vue: () => boolean;
 *  script: (extensions?: string[]) => boolean;
 *  style: (extensions?: string[]) => boolean;
 *  cssModule: (extensions?: string[]) => boolean;
 * }} ViteQueryIs
 */

/**
 * @see https://github.com/vitejs/vite/blob/364aae13f0826169e8b1c5db41ac6b5bb2756958/packages/plugin-vue/src/utils/query.ts - source of inspiration
 *
 * @param {string} id
 * @returns {{ filename: string; query: { [key: string]: string; }; is: ViteQueryIs }}
 */
module.exports = function parseViteRequest(id) {
  const [filename, rawQuery] = id.split('?', 2);
  const query = Object.fromEntries(new URLSearchParams(rawQuery));

  const is = {};

  if (query.raw !== void 0) {
    // if it's a ?raw request, then don't touch it at all
    is.vue = () => false;
    is.script = () => false;
    is.style = () => false;
    is.cssModule = () => false;
  } else if (query.vue !== void 0) { // is vue query ?
    // Almost all code might get merged into a single request with no 'type' (App.vue?vue)
    // or stay with their original 'type's (App.vue?vue&type=script&lang.ts)
    is.vue = () => true;
    is.script = (extensions = scriptExt) => (query.type === void 0 || query.type === 'script') && isOfExt({ query, extensions }) === true;
    is.style = (extensions = styleExt.concat(cssModuleExt)) => query.type === 'style' && isOfExt({ query, extensions }) === true;
    is.cssModule = (extensions = cssModuleExt) => query.type === 'style' && isOfExt({ query, extensions }) === true;
  } else {
    is.vue = () => isOfExt({ extensions: vueExt, filename });
    is.script = (extensions = scriptExt) => isOfExt({ filename, extensions });
    is.style = (extensions = styleExt) => isOfExt({ filename, extensions });
    is.cssModule = (extensions = cssModuleExt) => isOfExt({ filename, extensions }) === true;
  }

  return {
    filename,
    query,
    is,
  };
};
