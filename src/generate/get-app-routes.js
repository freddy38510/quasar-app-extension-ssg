/* eslint-disable no-underscore-dangle */
const { createBundle } = require('bundle-runner');

module.exports = async function getAppRoutes(opts) {
  const { evaluateEntry, rewriteErrorTrace } = createBundle(opts.serverManifest, {
    basedir: opts.basedir,
    runInNewContext: false,
  });

  try {
    const entry = await evaluateEntry();

    const app = await entry({
      req: { headers: {} },
      url: '/',
      res: {},
    });

    const routes = app._router?.matcher?.getRoutes() || [];

    return routes;
  } catch (err) {
    rewriteErrorTrace(err);

    throw err;
  }
};
