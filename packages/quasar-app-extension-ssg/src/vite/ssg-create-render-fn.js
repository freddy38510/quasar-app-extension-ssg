const { basename, join } = require('path');
const { renderToString } = require('vue/server-renderer');
const appPaths = require('@quasar/app-vite/lib/app-paths');
const createRenderHintTag = require('./create-render-hint-tag');

module.exports = function createRenderFn(quasarConf, viteDevServer) {
  // enable source map support for stack traces
  // https://nodejs.org/api/process.html#processsetsourcemapsenabledval
  if (quasarConf.ctx.prod) {
    process.setSourceMapsEnabled?.(true);
  }

  const serverEntryFile = viteDevServer
    ? appPaths.resolve.app('.quasar/server-entry.js')
    : join(quasarConf.ssg.compilationDir, 'server/server-entry.js');

  const clientManifest = viteDevServer
    ? {}
    : require(join(quasarConf.ssg.compilationDir, 'quasar.manifest.json'));

  const renderTemplate = viteDevServer
    ? undefined
    : require(join(quasarConf.ssg.compilationDir, 'render-template.js'));

  let renderApp = viteDevServer
    ? undefined
    : require(serverEntryFile).renderApp;

  // used only in production
  function renderModulesHint({ modules, _lazilyHydratedComponents }) {
    const renderHintTag = createRenderHintTag(
      quasarConf.ssg.shouldPreload,
      quasarConf.ssg.shouldPrefetch,
    );

    let hintLinks = '';
    const seen = new Set();

    modules.forEach((id) => {
      const files = clientManifest[id];
      if (files === void 0) {
        return;
      }

      const isLazilyHydrated = _lazilyHydratedComponents
        && [..._lazilyHydratedComponents].includes(id);

      files.forEach((file) => {
        if (seen.has(file) === true) {
          return;
        }

        seen.add(file);
        const filename = basename(file);

        if (clientManifest[filename] !== void 0) {
          clientManifest[filename].forEach((depFile) => {
            hintLinks += renderHintTag(depFile, isLazilyHydrated);
            seen.add(depFile);
          });
        }

        hintLinks += renderHintTag(file, isLazilyHydrated);
      });
    });

    return hintLinks;
  }

  function renderStoreState(ssrContext) {
    const serialize = require('serialize-javascript');

    const autoRemove = 'document.currentScript.remove()';

    const nonce = ssrContext.nonce !== void 0 ? ` nonce="${ssrContext.nonce}" ` : '';

    const state = serialize(ssrContext.state, { isJSON: true });
    return `<script${nonce}>window.__INITIAL_STATE__=${state};${autoRemove}</script>`;
  }

  return async function render(ssrContext) {
    const onRenderedList = [];

    Object.assign(ssrContext, {
      _meta: {},
      onRendered: (fn) => {
        onRenderedList.push(fn);
      },
    });

    if (viteDevServer) {
      ({ renderApp } = await viteDevServer.ssrLoadModule(
        serverEntryFile,
      ));
    }

    const app = await renderApp(ssrContext);

    let catchedVueError;
    app.config.errorHandler = (err) => {
      catchedVueError = err;
    };

    const runtimePageContent = await renderToString(app, ssrContext);

    if (catchedVueError) { throw catchedVueError; }

    onRenderedList.forEach((fn) => {
      fn();
    });

    // maintain compatibility with some well-known Vue plugins
    // like @vue/apollo-ssr:
    if (typeof ssrContext.rendered === 'function') {
      ssrContext.rendered();
    }

    if (quasarConf.store && quasarConf.ssr.manualStoreSerialization !== true) {
      if (ssrContext.state !== void 0) {
        ssrContext._meta.headTags = renderStoreState(ssrContext) + ssrContext._meta.headTags;
      }
    }

    if (!viteDevServer) {
      ssrContext._meta.runtimePageContent = runtimePageContent;

      // @vitejs/plugin-vue injects code into a component's setup() that registers
      // itself on ctx.modules. After the render, ctx.modules would contain all the
      // components that have been instantiated during this render call.
      ssrContext._meta.endingHeadTags += renderModulesHint(ssrContext);

      return renderTemplate(ssrContext);
    }

    return runtimePageContent;
  };
};
