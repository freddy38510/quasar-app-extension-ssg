/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 * */

const { renderToString: vueRenderToString } = require('@vue/server-renderer');
const createRenderer = require('quasar-app-extension-ssg/src/renderer/create-renderer');

<% if (ctx.prod) { %>
const renderTemplate = require('./render-template.js');
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
<% } %>

<% if (ctx.prod) { %>
module.exports = async (ssrContext) => renderer(ssrContext, renderTemplate);
<% } else { %>
module.exports = (serverManifest, clientManifest) => createRenderer({ ...opts, serverManifest, clientManifest });
<% } %>
