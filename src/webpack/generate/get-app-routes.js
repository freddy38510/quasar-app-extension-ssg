const { requireFromApp } = require('../../api');

module.exports = async function getAppRoutes(serverManifest) {
  const createBundle = requireFromApp('@quasar/ssr-helpers/lib/create-bundle');

  const { evaluateEntry, rewriteErrorTrace } = createBundle({ serverManifest });

  try {
    const { getRoutesFromRouter } = await evaluateEntry();

    return await getRoutesFromRouter();
  } catch (err) {
    await rewriteErrorTrace(err);

    throw err;
  }
};
