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

import { Quasar } from 'quasar';
import {
  markRaw,
  <% if (__needsAppMountHook === true) { %>
  defineComponent,
  h,
  onMounted,
  <% if (ssr.manualPostHydrationTrigger !== true) { %>
  getCurrentInstance,
  <% } %>
  <% } %>
} from 'vue';
<% if (__needsAppMountHook === true) { %>
import AppComponent from 'app/<%= sourceFiles.rootComponent %>';
<% } else { %>
import RootComponent from 'app/<%= sourceFiles.rootComponent %>';
<% } %>

<% if (store) { %>import createStore from 'app/<%= sourceFiles.store %>'<% } %>
import createRouter from 'app/<%= sourceFiles.router %>';

<% if (__needsAppMountHook === true) { %>
const RootComponent = defineComponent({
  name: 'AppWrapper',
  setup(props) {
    onMounted(() => {
      <% if (ssr.manualPostHydrationTrigger !== true) { %>
      const { proxy: { $q } } = getCurrentInstance();
      if ($q.onSSRHydrated !== void 0) {
        $q.onSSRHydrated();
      }
      <% } %>
    });

    return () => h(AppComponent, props);
  },
});
<% } %>

export const ssrIsRunningOnClientPWA = typeof window !== 'undefined'
  && document.body.getAttribute('data-server-rendered') === null;

export const getRoutesFromRouter = async () => {
  const router = typeof createRouter === 'function'
    ? await createRouter() : createRouter;

  return router.getRoutes();
};

export async function createQuasarApp(createAppFn, quasarUserOptions, ssrContext) {
  // Create the app instance.
  // Here we inject into it the Quasar UI, the router & possibly the store.
  const app = createAppFn(RootComponent);

  <% if (ctx.dev || ctx.debug) { %>
  app.config.performance = true;
  <% } %>

  app.use(Quasar, quasarUserOptions, ssrContext);

  <% if (store) { %>
  const store = typeof createStore === 'function'
    ? await createStore({ ssrContext })
    : createStore;

  <% if (__storePackage === 'vuex') { %>
  // obtain Vuex injection key in case we use TypeScript
  const { storeKey } = await import('app/<%= sourceFiles.store %>');
  <% } else if (__storePackage === 'pinia') { %>
  app.use(store);

  <% if (ssr.manualStoreHydration !== true) { %>
  // prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (typeof window !== 'undefined' && ssrIsRunningOnClientPWA !== true && window.__INITIAL_STATE__ !== void 0) {
    store.state.value = window.__INITIAL_STATE__;
    // for security reasons, we'll delete this
    delete window.__INITIAL_STATE__;
  }
  <% } %>
  <% } %>
  <% } %>

  const router = markRaw(
    typeof createRouter === 'function'
      ? await createRouter({ <%= `ssrContext${store ? ',' : ''}` %><%= store ? ' store' : '' %> })
      : createRouter,
  );

  <% if (store) { %>
  // make router instance available in store
  <% if (__storePackage === 'vuex') { %>
  store.$router = router;
  <% } else if (__storePackage === 'pinia') { %>
  store.use(({ store: piniaStore }) => { piniaStore.router = router; });
  <% } %>
  <% } %>

  // Expose the app, the router and the store.
  // Note that we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return {
    app,
    <% if (store) { %>
    store,
    <% } %>
    <% if (store && __storePackage === 'vuex') { %>
    storeKey,
    <% } %>
    router,
  };
}
