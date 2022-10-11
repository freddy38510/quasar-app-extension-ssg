/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 * */

const { renderToString: vueRenderToString } = require('@vue/server-renderer');
const createRenderer = require('quasar-app-extension-ssg/src/webpack/renderer/create-renderer');

<% if (ctx.prod) { %>
// eslint-disable-next-line import/extensions
const renderTemplate = require('./render-template');
const serverManifest = require('./quasar.server-manifest.json');
const clientManifest = require('./quasar.client-manifest.json');
<% } %>

const opts = {
  vueRenderToString,
  basedir: __dirname,
  <% if (ctx.prod) { %> serverManifest, <% } %>
  <% if (ctx.prod) { %> clientManifest, <% } %>
  manualStoreSerialization: <%= ssr.manualStoreSerialization === true %>,
  shouldPrefetch: <%= ssg.shouldPrefetch %>,
  shouldPreload: <%= ssg.shouldPreload %>,
};

<% if (ctx.prod) { %>
const renderer = createRenderer(opts);

module.exports = async (ssrContext) => renderer(ssrContext, renderTemplate);
<% } else { %>
module.exports = (serverManifest, clientManifest) => createRenderer({ ...opts, serverManifest, clientManifest });
<% } %>
