const { createHash } = require('crypto');

module.exports = function getHash(text) {
  return createHash('sha256').update(text).digest('hex').substring(0, 8);
};
