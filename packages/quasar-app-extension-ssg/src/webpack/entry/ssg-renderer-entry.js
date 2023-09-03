/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 */

import { renderToString as vueRenderToString } from 'vue/server-renderer';
import createRenderer from 'quasar-app-extension-ssg/src/webpack/create-renderer.js';
<% if (ctx.prod) { %>
import renderTemplate from './render-template.js';
import serverManifest from './quasar.server-manifest.json';
import clientManifest from './quasar.client-manifest.json';
<% } %>

const opts = {
  vueRenderToString,
  basedir: '<%= ssg.buildDir.replace(/\\/g, '\\\\') %>',
  <% if (ctx.prod) { %>
  serverManifest,
  clientManifest,
  <% } %>
  manualStoreSerialization: <%= ssr.manualStoreSerialization === true %>,
  shouldPrefetch: <%= ssg.shouldPrefetch %>,
  shouldPreload: <%= ssg.shouldPreload %>,
};

<% if (ctx.prod) { %>
const renderer = createRenderer(opts);

export default async (ssrContext) => renderer(ssrContext, renderTemplate);
<% } else { %>
export default (serverManifest, clientManifest) => createRenderer({ ...opts, serverManifest, clientManifest });
<% } %>
