const flatRoutes = function flatRoutes(routes) {
  return routes
    .filter((r) => ![':', '*'].some((c) => r.path.includes(c) || r.path === ''))
    .map((r) => r.path);
};

module.exports = flatRoutes;
