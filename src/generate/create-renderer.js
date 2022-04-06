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

function renderPreloadLinks(renderContext, usedAsyncFiles) {
  const { shouldPreload, preloadFiles } = renderContext;

  const files = (preloadFiles || []).concat(usedAsyncFiles || []);

  if (!(files.length > 0)) {
    return '';
  }

  return files.map(({
    file, extension, fileWithoutQuery, asType,
  }) => {
    let extra = '';

    if (!shouldPreload(fileWithoutQuery, asType, extension)) {
      return '';
    }

    if (asType === 'font') {
      extra = ` type="font/${extension}" crossorigin`;
    }

    return `<link rel="${isModule(file) ? 'modulepreload' : 'preload'}" href="${renderContext.publicPath}${file}"${asType !== '' ? ` as="${asType}"` : ''}${extra}>`;
  }).join('');
}

function renderPrefetchLinks(renderContext, usedAsyncFiles) {
  const { shouldPrefetch } = renderContext;

  if (!(renderContext.prefetchFiles.length > 0)) {
    return '';
  }

  const alreadyRendered = (file) => usedAsyncFiles && usedAsyncFiles.some((f) => f.file === file);

  return renderContext.prefetchFiles.map(({
    file, fileWithoutQuery, asType, extension,
  }) => {
    if (!shouldPrefetch(fileWithoutQuery, asType, extension)) {
      return '';
    }

    if (alreadyRendered(file)) {
      return '';
    }

    return `<link ${isModule(file) ? 'type="module" ' : ''}rel="prefetch${cssRE.test(file) ? ' stylesheet' : ''}" href="${renderContext.publicPath}${file}">`;
  }).join('');
}

function renderResourceHints(renderContext, usedAsyncFiles) {
  return renderPreloadLinks(renderContext, usedAsyncFiles)
    + renderPrefetchLinks(renderContext, usedAsyncFiles);
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

const autoRemove = 'var currentScript=document.currentScript;currentScript.parentNode.removeChild(currentScript)';

function renderVuexState(ssrContext, nonce) {
  if (ssrContext.state !== void 0) {
    const serialize = requireFromApp('serialize-javascript');

    const state = serialize(ssrContext.state, { isJSON: true });

    return `<script${nonce}>window.__INITIAL_STATE__=${state};${autoRemove}</script>`;
  }

  return '';
}

function renderScripts(renderContext, usedAsyncFiles, nonce) {
  if (renderContext.preloadFiles.length > 0) {
    const initial = renderContext.preloadFiles.filter(({ file }) => jsRE.test(file));
    const async = usedAsyncFiles.filter(({ file }) => jsRE.test(file));

    return [initial[0]].concat(async, initial.slice(1))
      .map(({ file }) => `<script${nonce} src="${renderContext.publicPath}${file}" defer></script>`)
      .join('');
  }

  return '';
}

module.exports = function createRenderer(opts) {
  const createBundle = requireFromApp('@quasar/ssr-helpers/lib/create-bundle');

  const renderContext = createRenderContext(opts);
  const { evaluateEntry, rewriteErrorTrace } = createBundle(opts);

  async function runApp(ssrContext) {
    try {
      const entry = await evaluateEntry();

      const app = await entry(ssrContext);

      return app;
    } catch (err) {
      rewriteErrorTrace(err);

      throw err;
    }
  }

  return async function renderToString(ssrContext, renderTemplate) {
    try {
      const onRenderedList = [];

      Object.assign(ssrContext, {
        _modules: new Set(),
        _meta: {},
        onRendered: (fn) => { onRenderedList.push(fn); },
      });

      const app = await runApp(ssrContext);
      const resourceApp = await opts.vueRenderToString(app, ssrContext);

      const usedAsyncFiles = renderContext
        .mapFiles(Array.from(ssrContext._modules))
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
        resourceHints: renderResourceHints(renderContext, usedAsyncFiles),
        resourceStyles: renderStyles(renderContext, usedAsyncFiles, ssrContext),
        resourceScripts: (
          renderVuexState(ssrContext, nonce)
          + renderScripts(renderContext, usedAsyncFiles, nonce)
        ),
      });

      return renderTemplate(ssrContext);
    } catch (err) {
      await rewriteErrorTrace(err);

      throw err;
    }
  };
};
