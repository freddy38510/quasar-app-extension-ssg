module.exports = function promisifyRoutes(fn, ...args) {
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
