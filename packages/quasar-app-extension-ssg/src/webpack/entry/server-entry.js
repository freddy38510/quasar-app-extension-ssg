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
 */

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
import 'quasar/dist/quasar.<%= __css.quasarSrcExt %>';

<% if (framework.cssAddon) { %>
// We add Quasar addons, if they were requested
import 'quasar/src/css/flex-addon.sass';
<% } %>

<% if (css.length > 0) { %>
<% css.filter((asset) => asset.server !== false).forEach((asset) => { %>
import '<%= asset.path %>';
<% }) %>
<% } %>

import { createQuasarApp } from './app.js';
import quasarUserOptions from './quasar-user-options.js';

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

<%
  const bootNames = [];

  if (boot.length > 0) {
    const hash = function hash(str) {
      const name = str.replace(/\W+/g, '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    boot.filter((asset) => asset.server !== false).forEach((asset) => {
      const importName = `qboot_${hash(asset.path)}`;
      bootNames.push(importName);
%>
import <%= importName %> from '<%= asset.path %>';
<% }); // end of forEach
  } %> // end of if

const publicPath = `<%= build.publicPath %>`;
<% if (build.publicPath !== '/') { %>
const doubleSlashRE = /\/\//;
const addPublicPath = (url) => (publicPath + url).replace(doubleSlashRE, '/');
<% } %>

const bootFiles = [<%= bootNames.join(',') %>].filter((boot) => typeof boot === 'function');
const httpRE = /^https?:\/\//;

function getRedirectUrl(url, router) {
  if (typeof url === 'string' && httpRE.test(url) === true) {
    return url;
  }

  try {
    return router.resolve(url).href;
  } catch (err) {
    // continue regardless of error
  }

  return url;
}

const { components, directives, ...qUserOptions } = quasarUserOptions;

export { getRoutesFromRouter } from './app.js';

// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export async function renderApp(ssrContext) {
  const {
    app,
    router,
    <% if (store) { %>
    store,
    <% } %>
    <% if (store && __storePackage === 'vuex') { %>
    storeKey,
    <% } %>
  } = await createQuasarApp(createSSRApp, qUserOptions, ssrContext);

  <% if (bootNames.length > 0 || preFetch) { %>
  const redirect = (url, httpStatusCode) => {
    const err = new Error();
    err.url = getRedirectUrl(url, router);
    err.code = httpStatusCode;
    throw err;
  };
  <% } %>

  <% if (bootNames.length > 0) { %>
  await Promise.all(bootFiles.map((fn) => fn({
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
  <% if (store && __storePackage === 'vuex') { %>app.use(store, storeKey)<% } %>

  <% if (build.publicPath !== '/') { %>
  const url = ssrContext.req.url.replace(publicPath, '/');
  <% } else { %>
  const { url } = ssrContext.req;
  <% } %>
  const routeLocation = router.resolve(url);

  if (routeLocation.fullPath !== url) {
    <% if (build.publicPath === '/') { %>
    const redirectErr = {
      url: routeLocation.fullPath,
    };
    <% } else { %>
    const redirectErr = {
      url: addPublicPath(routeLocation.fullPath),
    };
    <% } %>

    throw redirectErr;
  }

  // "catch-all" route
  if (routeLocation.matched.some(({ path }) => /^\/:\w*\(\.\*\)\*?$/.test(path))) {
    const err = new Error();
    err.code = 404;
    throw err;
  }

  // set router's location
  await router.push(url);

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
}
