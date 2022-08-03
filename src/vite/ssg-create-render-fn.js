/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */

const { basename, join } = require('path');
const { requireFromApp } = require('./helpers/packages');
const createRenderHintsTag = require('./create-render-hints-tag');
const appPaths = require('./app-paths');

const { renderToString } = requireFromApp('vue/server-renderer');

module.exports = function createRenderFn(quasarConf, viteDevServer) {
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
  function renderModulesHints({ modules, _lazilyHydratedComponents }) {
    const renderHintsTag = createRenderHintsTag(
      quasarConf.ssg.shouldPreload,
      quasarConf.ssg.shouldPrefetch,
    );

    const seen = new Set();

    let hintsLinks = '';

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
            hintsLinks += renderHintsTag(depFile, isLazilyHydrated);
            seen.add(depFile);
          });
        }

        hintsLinks += renderHintsTag(file, isLazilyHydrated);
      });
    });

    return hintsLinks;
  }

  function renderStoreState(ssrContext) {
    const serialize = requireFromApp('serialize-javascript');

    const autoRemove = 'var currentScript=document.currentScript;currentScript.parentNode.removeChild(currentScript)';

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
    const runtimePageContent = await renderToString(app, ssrContext);

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
      ssrContext._meta.endingHeadTags += renderModulesHints(ssrContext);

      return renderTemplate(ssrContext);
    }

    return runtimePageContent;
  };
};
