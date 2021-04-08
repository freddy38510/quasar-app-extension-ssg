module.exports = function getUniqueArray(original) {
  return Array.from(new Set(original));
};
