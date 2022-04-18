/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 * */

import getAppRoutes from 'quasar-app-extension-ssg/src/build/get-app-routes';
import flatRoutes from 'quasar-app-extension-ssg/src/helpers/flat-routes';

import serverManifest from './quasar.server-manifest.json';

export default async () => flatRoutes(await getAppRoutes({
  basedir: __dirname,
  serverManifest,
}));
