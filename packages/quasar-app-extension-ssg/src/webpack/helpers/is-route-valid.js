const { extname } = require('path');

module.exports = function isRouteValid(route) {
  if (route.startsWith('/') && !route.startsWith('//') && !extname(route)) {
    return true;
  }

  return false;
};
