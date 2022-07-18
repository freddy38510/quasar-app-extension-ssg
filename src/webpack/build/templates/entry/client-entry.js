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

import { createSSRApp, createApp } from 'vue';

<% const bootEntries = boot.filter((asset) => asset.client !== false) %>

<% extras.length > 0 && extras.filter((asset) => asset).forEach((asset) => { %>
import '@quasar/extras/<%= asset %>/<%= asset %>.css';
<% }) %>

<% animations.length > 0 && animations.filter((asset) => asset).forEach((asset) => { %>
import '@quasar/extras/animate/<%= asset %>.css';
<% }) %>

// We load Quasar stylesheet file
import 'quasar/dist/quasar.<%= __css.quasarSrcExt %>';

<% if (framework.cssAddon) { %>
// We add Quasar addons, if they were requested
import 'quasar/src/css/flex-addon.sass';
<% } %>

<% css.length > 0 && css.filter((asset) => asset.client !== false).forEach((asset) => { %>
import '<%= asset.path %>';
<% }) %>

import createQuasarApp, { ssrIsRunningOnClientPWA } from './app.js';
import quasarUserOptions from './quasar-user-options.js';

<% if (ctx.mode.pwa) { %>
import 'app/<%= sourceFiles.registerServiceWorker %>';
<% } %>

<% if (preFetch) { %>
import { addPreFetchHooks } from './client-prefetch.js';
<% } %>

<% if (ctx.dev) { %>
console.info('[Quasar] Running <%= ctx.modeName.toUpperCase() + (ctx.mode.ssr && ctx.mode.pwa ? ' + PWA' : '') %>.');
if (ssrIsRunningOnClientPWA === true) {
  console.info('[Quasar] Hit SPA fallback (<%= ssg.fallback %>).');
}
<% } %>

<% if (ctx.mode.pwa) { %>
// Needed only for iOS PWAs
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && window.navigator.standalone) {
  import(/* webpackChunkName: "fastclick"  */ '@quasar/fastclick');
}
<% } %>

const publicPath = `<%= build.publicPath %>`;
<% if (build.publicPath.length > 1) { %>
const doubleSlashRE = /\/\//;
const addPublicPath = (url) => (publicPath + url).replace(doubleSlashRE, '/');
<% } %>

async function start ({
  app,
  router
  <%= store ? `, store${__storePackage === 'vuex' ? ', storeKey' : ''}` : '' %>
}<%= bootEntries.length > 0 ? ', bootFiles' : '' %>) {
  <% if (store && __storePackage === 'vuex' && ssr.manualStoreHydration !== true) { %>
  // prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (ssrIsRunningOnClientPWA !== true && window.__INITIAL_STATE__ !== void 0) {
    store.replaceState(window.__INITIAL_STATE__);
    // for security reasons, we'll delete this
    delete window.__INITIAL_STATE__;
  }
  <% } %>

  <% if (bootEntries.length > 0) { %>
  let hasRedirected = false
  const getRedirectUrl = url => {
    try { return <%= build.publicPath.length <= 1 ? 'router.resolve(url).href' : 'addPublicPath(router.resolve(url).href)' %> }
    catch (err) {}

    return Object(url) === url
      ? null
      : url
  }
  const redirect = url => {
    hasRedirected = true

    if (typeof url === 'string' && /^https?:\/\//.test(url)) {
      window.location.href = url
      return
    }

    const href = getRedirectUrl(url)

    // continue if we didn't fail to resolve the url
    if (href !== null) {
      window.location.href = href
    }
  }

  const urlPath = window.location.href.replace(window.location.origin, '')

  for (let i = 0; hasRedirected === false && i < bootFiles.length; i++) {
    try {
      await bootFiles[i]({
        app,
        router,
        <%= store ? 'store,' : '' %>
        ssrContext: null,
        redirect,
        urlPath,
        publicPath
      })
    }
    catch (err) {
      if (err && err.url) {
        redirect(err.url)
        return
      }
      console.error('[Quasar] boot error:', err)
      return
    }
  }
  if (hasRedirected === true) {
    return
  }
  <% } %>
  app.use(router);
  <% if (store && __storePackage === 'vuex') { %>app.use(store, storeKey)<% } %>
  if (ssrIsRunningOnClientPWA === true) {
    <% if (preFetch) { %>
    addPreFetchHooks({ router, ssrIsRunningOnClientPWA<%= store ? ', store' : '' %> });
    <% } %>
    app.mount('#q-app');
  } else {
    // wait until router has resolved all async before hooks
    // and async components...
    router.isReady().then(() => {
      <% if (preFetch) { %>
      addPreFetchHooks({ router<%= store ? ', store' : '' %>, publicPath });
      <% } %>
      app.mount('#q-app');
    });
  }
}

createQuasarApp(ssrIsRunningOnClientPWA ? createApp : createSSRApp, quasarUserOptions)
<% if (bootEntries.length > 0) { %>
  .then(app => {
    return Promise.all([
      <% bootEntries.forEach((asset, index) => { %>
      import(/* webpackMode: "eager" */ '<%= asset.path %>')<%= index < bootEntries.length - 1 ? ',' : '' %>
      <% }) %>
    ]).then(bootFiles => {
      const boot = bootFiles
        .map(entry => entry.default)
        .filter(entry => typeof entry === 'function')

      start(app, boot)
    })
  })
<% } else { %>
  .then(start);
<% } %>
