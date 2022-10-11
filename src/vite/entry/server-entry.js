/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.config.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 * */
import { createSSRApp<% if (store && ssr.manualStoreSsrContextInjection !== true) { %>, unref<% } %> } from 'vue';

<% if (extras.length > 0) { %>
<% extras.filter((asset) => asset).forEach((asset) => { %>
import '@quasar/extras/<%= asset %>/<%= asset %>.css';
<% }) %>
<% } %>

<% if (animations.length > 0) { %>
<% animations.filter((asset) => asset).forEach((asset) => { %>
import '@quasar/extras/animate/<%= asset %>.css';
<% }) %>
<% } %>

// We load Quasar stylesheet file
import 'quasar/dist/quasar.<%= metaConf.css.quasarSrcExt %>';

<% if (framework.cssAddon) { %>
// We add Quasar addons, if they were requested
import 'quasar/src/css/flex-addon.sass';
<% } %>

<% if (css.length > 0) { %>
<% css.filter((asset) => asset.server !== false).forEach((asset) => { %>
import '<%= asset.path %>';
<% }) %>
<% } %>

import { createQuasarApp } from './app';
// eslint-disable-next-line import/extensions
import quasarUserOptions from './quasar-user-options';

<% if (preFetch) { %>
import App from 'app/<%= sourceFiles.rootComponent %>';

let appPrefetch;

if (typeof App.preFetch === 'function') {
  appPrefetch = App.preFetch;
} else {
  // Class components return the component options (and the preFetch hook) inside __c property
  appPrefetch = App.__c !== void 0 && typeof App.__c.preFetch === 'function'
    ? App.__c.preFetch
    : false;
}
<% } %>

const publicPath = `<%= build.publicPath %>`;
<% if (build.publicPath !== '/') { %>
const doubleSlashRE = /\/\//;
const addPublicPath = (url) => (publicPath + url).replace(doubleSlashRE, '/');
<% } %>

const httpRE = /^https?:\/\//;

function getRedirectUrl(url, router) {
  if (typeof url === 'string' && httpRE.test(url) === true) {
    return url;
  }

  try {
    <% if (build.publicPath === '/') { %>
    return router.resolve(url).href;
    <% } else { %>
    return addPublicPath(router.resolve(url).href);
    <% } %>
  } catch (err) {
    // continue regardless of error
  }

  return url;
}

const { components, directives, ...qUserOptions } = quasarUserOptions;

<%
const bootEntries = boot.filter((asset) => asset.server !== false);
if (bootEntries.length !== 0) { %>
const bootFiles = Promise.all([
  <% bootEntries.forEach((asset) => { %>
  import('<%= asset.path %>'),
  <% }) %>
]).then((resolvedBootFiles) => resolvedBootFiles.map((entry) => entry.default).filter((entry) => typeof entry === 'function'));
<% } %>

export { getRoutesFromRouter } from './app';

// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export const renderApp = async (ssrContext) => {
  <% if (bootEntries.length !== 0) { %>
  const bootFunctions = await bootFiles;
  <% } %>

  const {
    app,
    router,
    <% if (store) { %>
    store,
    <% } %>
    <% if (store && metaConf.storePackage === 'vuex') { %>
    storeKey,
    <% } %>
  } = await createQuasarApp(createSSRApp, qUserOptions, ssrContext);

  <% if (bootEntries.length !== 0 || preFetch) { %>
  const redirect = (url, httpStatusCode) => {
    const err = new Error();
    err.url = getRedirectUrl(url, router);
    err.code = httpStatusCode;
    throw err;
  };
  <% } %>

  <% if (bootEntries.length !== 0) { %>
  await Promise.all(bootFunctions.map((fn) => fn({
    app,
    router,
    <% if (store) { %>
    store,
    <% } %>
    ssrContext,
    redirect,
    urlPath: ssrContext.req.url,
    publicPath,
  })));
  <% } %>

  app.use(router);
  <% if (store && metaConf.storePackage === 'vuex') { %>app.use(store, storeKey)<% } %>

  const url = ssrContext.req.url.replace(publicPath, '/');
  const { fullPath } = router.resolve(url);

  if (fullPath !== url) {
    const err = new Error();
    err.url = <%= build.publicPath === '/' ? 'fullPath' : 'addPublicPath(fullPath)' %>;
    throw err;
  }

  // set router's location
  router.push(url).catch(() => {});

  // wait until router has resolved possible async hooks
  await router.isReady();

  let matchedComponents = router.currentRoute.value.matched
    .filter((record) => record.components !== void 0)
    .flatMap((record) => Object.values(record.components));

  // no matched routes
  if (matchedComponents.length === 0) {
    const err = new Error();
    err.code = 404;
    throw err;
  }

  <% if (preFetch) { %>
  // filter and convert all components to their preFetch methods
  matchedComponents = matchedComponents
    .filter((m) => (
      typeof m.preFetch === 'function'
          // Class components return the component options (and the preFetch hook) inside __c property
          || (m.__c !== void 0 && typeof m.__c.preFetch === 'function')
    ))
    .map((m) => (m.__c !== void 0 ? m.__c.preFetch : m.preFetch));

  if (appPrefetch !== false) {
    matchedComponents.unshift(appPrefetch);
  }

  // Call preFetch hooks on components matched by the route.
  // A preFetch hook dispatches a store action and returns a Promise,
  // which is resolved when the action is complete and store state has been
  // updated.
  await Promise.all(matchedComponents.map(async (preFetchFn) => preFetchFn({
    <% if (store) { %>
    store,
    <% } %>
    ssrContext,
    currentRoute: router.currentRoute.value,
    redirect,
    urlPath: ssrContext.req.url,
    publicPath,
  })));
  <% } %>

  <% if (store && ssr.manualStoreSsrContextInjection !== true) { %>ssrContext.state = unref(store.state);<% } %>

  return app;
};
