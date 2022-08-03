const path = require('path');

module.exports.flatRoutes = function flatRoutes(routes) {
  return routes
    .filter((r) => ![':', '*'].some((c) => r.path.includes(c) || r.path === ''))
    .map((r) => r.path);
};

module.exports.isRouteValid = function isRouteValid(route) {
  if (route.startsWith('/') && !route.startsWith('//') && !path.extname(route)) {
    return true;
  }

  return false;
};

module.exports.promisifyRoutes = function promisifyRoutes(fn, ...args) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn);
  }

  // If routes is a function expecting a callback
  if (fn.length === arguments.length) {
    return new Promise((resolve, reject) => {
      fn((err, routeParams) => {
        if (err) {
          reject(err);
        }
        resolve(routeParams);
      }, ...args);
    });
  }

  let promise = fn(...args);

  if (
    !promise
    || (!(promise instanceof Promise) && typeof promise.then !== 'function')
  ) {
    promise = Promise.resolve(promise);
  }

  return promise;
};
