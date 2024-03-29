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

<% if (__loadingBar) { %>
import { LoadingBar } from 'quasar';
<% } %>

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

function getMatchedComponents(to, router) {
  let route = to || router.currentRoute.value;

  if (to && to.matched) {
    route = to;
  } else {
    route = router.resolve(to).route;
  }

  if (!route) { return []; }

  const matched = route.matched.filter((m) => m.components !== void 0);

  if (matched.length === 0) { return []; }

  return Array.prototype.concat.apply([], matched.map((m) => Object.keys(m.components)
    .map((key) => {
      const comp = m.components[key];
      return {
        path: m.path,
        c: comp,
      };
    })));
}

export function addPreFetchHooks({
  router,
  ssrIsRunningOnClientPWA,
  <% if (store) { %>
  store,
  <% } %>
  publicPath,
}) {
  // Add router hook for handling preFetch.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const urlPath = window.location.href.replace(window.location.origin, '');
    const matched = getMatchedComponents(to, router);
    const prevMatched = getMatchedComponents(from, router);

    let diffed = false;
    const preFetchList = matched
      .filter((m, i) => {
        if (diffed) {
          return diffed;
        }

        diffed = (
          !prevMatched[i]
          || prevMatched[i].c !== m.c
          || m.path.indexOf('/:') > -1 // does it has params?
        );

        return diffed;
      })
      .filter((m) => m.c !== void 0 && (
        typeof m.c.preFetch === 'function'
        // Class components return the component options (and the preFetch hook) inside __c property
        || (m.c.__c !== void 0 && typeof m.c.__c.preFetch === 'function')
      ))
      .map((m) => {
        if (m.c.__c !== void 0) {
          return m.c.__c.preFetch;
        }

        return m.c.preFetch;
      });

    if (ssrIsRunningOnClientPWA === true && appPrefetch !== false) {
      preFetchList.unshift(appPrefetch);
      appPrefetch = false;
    }

    if (preFetchList.length === 0) {
      next();

      return;
    }

    let hasRedirected = false;
    const redirect = (url) => {
      hasRedirected = true;
      next(url);
    };
    const proceed = () => {
      <% if (__loadingBar) { %>
      LoadingBar.stop();
      <% } %>
      if (hasRedirected === false) { next(); }
    };

    <% if (__loadingBar) { %>
    LoadingBar.start();
    <% } %>

    preFetchList.reduce(
      (promise, preFetch) => promise.then(() => hasRedirected === false && preFetch({
        <% if (store) { %>
        store,
        <% } %>
        currentRoute: to,
        previousRoute: from,
        redirect,
        urlPath,
        publicPath,
      })),
      Promise.resolve(),
    )
      .then(proceed)
      .catch((e) => {
        console.error(e);
        proceed();
      });
  });
}
