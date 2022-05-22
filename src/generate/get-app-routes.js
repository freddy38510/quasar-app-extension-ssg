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
    if (err.url) {
      throw new Error(`route "/" redirects to ${err.url}${err.code ? ` with error code ${err.code}` : ''}`);
    } else if (err.code === 404) {
      throw new Error('404 not found');
    }

    await rewriteErrorTrace(err);

    throw err;
  }
};
