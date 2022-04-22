/* eslint-disable no-underscore-dangle */
const { createBundle } = require('bundle-runner');
const { hasPackage } = require('../helpers/packages');

const hasVueRouterGetRoutes = hasPackage('vue-router', '>=3.5.0');

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

    if (hasVueRouterGetRoutes) {
      return app._router.matcher.getRoutes() || [];
    }

    return app._router.options.routes || [];
  } catch (err) {
    rewriteErrorTrace(err);

    throw err;
  }
};
