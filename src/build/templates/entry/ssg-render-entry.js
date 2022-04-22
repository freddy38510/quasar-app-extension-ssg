/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 **/
import { renderToString } from '@vue/server-renderer';
import createRenderer from 'quasar-app-extension-ssg/src/build/create-renderer';

import renderTemplate from './render-template';
import serverManifest from './quasar.server-manifest.json';
import clientManifest from './quasar.client-manifest.json';

const render = createRenderer({
  vueRenderToString: renderToString,
  basedir: __dirname,
  serverManifest,
  clientManifest,
  manualStoreSerialization: <%= ssr.manualStoreSerialization === true %>,
  shouldPrefetch: <%= ssg.shouldPrefetch %>,
  shouldPreload: <%= ssg.shouldPreload %>,
});

export default async (ssrContext) => render(ssrContext, renderTemplate);
