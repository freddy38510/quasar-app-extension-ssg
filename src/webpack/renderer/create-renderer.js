/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
/*
 * Forked from vue-bundle-renderer v0.2.10 NPM package
 */

const { extname } = require('path');
const requireFromApp = require('../helpers/require-from-app');

const jsRE = /\.js(\?[^.]+)?$/;
const jsModuleRE = /\.mjs(\?[^.]+)?$/;
const cssRE = /\.css(\?[^.]+)?$/;
const jsCssRE = /\.(js|css)($|\?)/;
const queryRE = /\?.*/;
const extRE = /[^./]+\.[^./]+$/;
const trailingSlashRE = /([^/])$/;

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function deepClone(val) {
  if (isPlainObject(val)) {
    const res = {};

    Object.keys(val).forEach((key) => {
      res[key] = deepClone(val[key]);
    });

    return res;
  }

  if (Array.isArray(val)) {
    return val.slice();
  }

  return val;
}

function mapIdToFile(id, clientManifest) {
  const files = [];
  const fileIndices = clientManifest.modules[id];

  if (fileIndices !== void 0) {
    fileIndices.forEach((index) => {
      const file = clientManifest.all[index];

      // only include async files or non-js, non-css assets
      if (
        file
        && (clientManifest.async.includes(file)
          || !jsCssRE.test(file))
      ) {
        files.push(file);
      }
    });
  }

  return files;
}

/**
 * Creates a mapper that maps components used during a server-side render
 * to async chunk files in the client-side build, so that we can inline them
 * directly in the rendered HTML to avoid waterfall requests.
*/
function createMapper(clientManifest) {
  const map = new Map();

  Object.keys(clientManifest.modules).forEach((id) => {
    map.set(id, mapIdToFile(id, clientManifest));
  });

  // map server-side moduleIds to client-side files
  return function mapper(moduleIds) {
    const res = new Set();

    for (let i = 0; i < moduleIds.length; i += 1) {
      const mapped = map.get(moduleIds[i]);

      if (mapped) {
        for (let j = 0; j < mapped.length; j += 1) {
          const entry = mapped[j];

          if (entry !== void 0) {
            res.add(mapped[j]);
          }
        }
      }
    }

    return Array.from(res);
  };
}

function isModule(file) {
  return jsModuleRE.test(file) || !extRE.test(file);
}

function getPreloadType(ext) {
  if (ext === 'js' || ext === 'cjs' || ext === 'mjs') {
    return 'script';
  }

  if (ext === 'css') {
    return 'style';
  }

  if (/jpe?g|png|svg|gif|webp|ico/.test(ext)) {
    return 'image';
  }

  if (/woff2?|ttf|otf|eot/.test(ext)) {
    return 'font';
  }

  // not exhausting all possibilities here, but above covers common cases
  return '';
}

function normalizeFile(file) {
  const fileWithoutQuery = file.replace(queryRE, '');
  const extension = extname(fileWithoutQuery).slice(1);

  return {
    file,
    extension,
    fileWithoutQuery,
    asType: getPreloadType(extension),
  };
}

function ensureTrailingSlash(path) {
  return path === ''
    ? path
    : path.replace(trailingSlashRE, '$1/');
}

function createRenderContext({ clientManifest, shouldPrefetch, shouldPreload }) {
  return {
    clientManifest,
    shouldPrefetch,
    shouldPreload,
    publicPath: ensureTrailingSlash(clientManifest.publicPath || '/'),
    preloadFiles: (clientManifest.initial || []).map(normalizeFile),
    prefetchFiles: (clientManifest.async || []).map(normalizeFile),
    mapFiles: createMapper(clientManifest),
  };
}

function renderPreloadLinks(renderContext, usedAsyncFiles, lazilyHydratedComponents) {
  const { shouldPreload, preloadFiles } = renderContext;

  const files = (preloadFiles || []).concat(usedAsyncFiles || []);

  if (!(files.length > 0)) {
    return '';
  }

  return files.map(({
    file, extension, fileWithoutQuery, asType,
  }) => {
    let extra = '';

    if (!shouldPreload(
      fileWithoutQuery,
      asType,
      extension,
      lazilyHydratedComponents.some((f) => f.file === file),
    )) {
      return '';
    }

    if (asType === 'font') {
      extra = ` type="font/${extension}" crossorigin`;
    }

    return `<link rel="${isModule(file) ? 'modulepreload' : 'preload'}" href="${renderContext.publicPath}${file}"${asType !== '' ? ` as="${asType}"` : ''}${extra}>`;
  }).join('');
}

function renderPrefetchLinks(renderContext, usedAsyncFiles, lazilyHydratedComponents) {
  const { shouldPrefetch } = renderContext;

  if (!(renderContext.prefetchFiles.length > 0)) {
    return '';
  }

  const alreadyRendered = (file) => usedAsyncFiles && usedAsyncFiles.some((f) => f.file === file);

  return renderContext.prefetchFiles.map(({
    file, fileWithoutQuery, asType, extension,
  }) => {
    if (!shouldPrefetch(
      fileWithoutQuery,
      asType,
      extension,
      lazilyHydratedComponents.some((f) => f.file === file),
    )) {
      return '';
    }

    if (alreadyRendered(file)) {
      return '';
    }

    return `<link ${isModule(file) ? 'type="module" ' : ''}rel="prefetch${cssRE.test(file) ? ' stylesheet' : ''}" href="${renderContext.publicPath}${file}">`;
  }).join('');
}

function renderResourceHints(renderContext, usedAsyncFiles, lazilyHydratedComponents) {
  return renderPreloadLinks(renderContext, usedAsyncFiles, lazilyHydratedComponents)
    + renderPrefetchLinks(renderContext, usedAsyncFiles, lazilyHydratedComponents);
}

function renderStyles(renderContext, usedAsyncFiles, ssrContext) {
  const initial = renderContext.preloadFiles;
  const cssFiles = initial.concat(usedAsyncFiles).filter(({ file }) => cssRE.test(file));

  return (
    // render links for css files
    (
      cssFiles.length
        ? cssFiles.map(({ file }) => `<link rel="stylesheet" href="${renderContext.publicPath}${file}">`).join('')
        : ''
    )
    // ssrContext.styles is a getter exposed by vue-style-loader which contains
    // the inline component styles collected during SSR
    + (ssrContext.styles || '')
  );
}

const autoRemove = 'document.currentScript.remove()';

function renderStoreState(ssrContext, nonce) {
  if (ssrContext.state !== void 0) {
    const serialize = requireFromApp('serialize-javascript');

    const state = serialize(ssrContext.state, { isJSON: true });

    return `<script${nonce}>window.__INITIAL_STATE__=${state};${autoRemove}</script>`;
  }

  return '';
}

function renderScripts(renderContext, usedAsyncFiles, lazilyHydratedComponents, nonce) {
  if (renderContext.preloadFiles.length > 0) {
    const initial = renderContext.preloadFiles.filter(({ file }) => jsRE.test(file));

    const async = usedAsyncFiles
      .filter(({ file }) => jsRE.test(file))
      .filter(({ file }) => !lazilyHydratedComponents.some((f) => f.file === file));

    return [initial[0]].concat(async, initial.slice(1))
      .map(({ file }) => `<script${nonce} src="${renderContext.publicPath}${file}" defer></script>`)
      .join('');
  }

  return '';
}

module.exports = function createRenderer(opts) {
  if (!opts.serverManifest) {
    throw new Error('Missing server bundle');
  }

  if (!opts.clientManifest) {
    throw new Error('Missing client manifest');
  }

  const createBundle = requireFromApp('@quasar/ssr-helpers/lib/create-bundle');

  const renderContext = createRenderContext(opts);

  global.__VUE_SSR_CONTEXT__ = {};

  const initialContext = global.__VUE_SSR_CONTEXT__;

  opts.runningScriptOptions = global;

  const { evaluateEntry, rewriteErrorTrace } = createBundle(opts);

  async function runApp(ssrContext) {
    try {
      const { renderApp } = await evaluateEntry();

      // On subsequent renders, __VUE_SSR_CONTEXT__ will not be available
      // to prevent cross-request pollution.
      delete global.__VUE_SSR_CONTEXT__;

      // vue-style-loader styles imported outside of component lifecycle hooks
      if (initialContext._styles) {
        ssrContext._styles = deepClone(initialContext._styles);
        // https://github.com/vuejs/vue/issues/6353
        // ensure "styles" is exposed even if no styles are injected
        // in component lifecycles.
        // the renderStyles fn is exposed by vue-style-loader >= 3.0.3
        if (initialContext._renderStyles) {
          Object.defineProperty(ssrContext, 'styles', {
            enumerable: true,
            get() {
              return initialContext._renderStyles(ssrContext._styles);
            },
          });
        }
      }

      return await renderApp(ssrContext);
    } catch (err) {
      await rewriteErrorTrace(err);

      throw err;
    }
  }

  return async function renderToString(ssrContext, renderTemplate) {
    try {
      const onRenderedList = [];

      Object.assign(ssrContext, {
        _modules: new Set(),
        _lazilyHydratedComponents: new Set(),
        _meta: {},
        onRendered: (fn) => { onRenderedList.push(fn); },
      });

      const app = await runApp(ssrContext);
      const resourceApp = await opts.vueRenderToString(app, ssrContext);

      const usedAsyncFiles = renderContext
        .mapFiles(Array.from(ssrContext._modules))
        .map(normalizeFile);

      const lazilyHydratedComponents = renderContext
        .mapFiles(Array.from(ssrContext._lazilyHydratedComponents))
        .map(normalizeFile);

      onRenderedList.forEach((fn) => { fn(); });

      // maintain compatibility with some well-known Vue plugins
      // like @vue/apollo-ssr:
      if (typeof ssrContext.rendered === 'function') {
        ssrContext.rendered();
      }

      const nonce = ssrContext.nonce !== void 0
        ? ` nonce="${ssrContext.nonce}" `
        : '';

      Object.assign(ssrContext._meta, {
        resourceApp,
        resourceHints: renderResourceHints(renderContext, usedAsyncFiles, lazilyHydratedComponents),
        resourceStyles: renderStyles(renderContext, usedAsyncFiles, ssrContext),
        resourceScripts: (
          (opts.manualStoreSerialization !== true && ssrContext.state !== void 0 ? renderStoreState(ssrContext, nonce) : '')
          + renderScripts(renderContext, usedAsyncFiles, lazilyHydratedComponents, nonce)
        ),
      });

      return renderTemplate(ssrContext);
    } catch (err) {
      await rewriteErrorTrace(err);

      throw err;
    }
  };
};
