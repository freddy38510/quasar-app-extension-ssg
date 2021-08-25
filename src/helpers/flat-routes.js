const flatRoutes = function flatRoutes(router) {
  return router
    .filter((r) => ![':', '*'].some((c) => r.path.includes(c) || r.path === ''))
    .map((r) => r.path);
};

module.exports = flatRoutes;
