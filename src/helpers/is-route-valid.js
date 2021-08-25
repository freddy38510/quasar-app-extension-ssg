const path = require('path');

const isRouteValid = function isRouteValid(route) {
  if (route.startsWith('/') && !route.startsWith('//') && !path.extname(route)) {
    return true;
  }

  return false;
};

module.exports = isRouteValid;
