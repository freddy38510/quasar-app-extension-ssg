const createBundle = require('@quasar/ssr-helpers/lib/create-bundle');

module.exports = async function getAppRoutes(serverManifest) {
  const { evaluateEntry, rewriteErrorTrace } = createBundle({ serverManifest });

  try {
    const { getRoutesFromRouter } = await evaluateEntry();

    return await getRoutesFromRouter();
  } catch (err) {
    await rewriteErrorTrace(err);

    throw err;
  }
};
