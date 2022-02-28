module.exports = function getAssetName(asset) {
  if (typeof asset === 'string') {
    return asset;
  }

  return asset.name;
};
