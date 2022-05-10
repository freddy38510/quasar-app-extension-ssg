const requireFromApp = require('../helpers/require-from-app');

module.exports = async function getAppRoutes(opts) {
  const createBundle = requireFromApp('@quasar/ssr-helpers/lib/create-bundle');
  const { routerKey } = requireFromApp('vue-router');

  const { evaluateEntry, rewriteErrorTrace } = createBundle(opts);

  try {
    const entry = await evaluateEntry();

    const { _context: { provides } } = await entry({
      req: { headers: {}, url: '/' },
      res: {},
    });

    const routes = provides[routerKey].getRoutes() || [];

    return routes;
  } catch (err) {
    rewriteErrorTrace(err);

    throw err;
  }
};
