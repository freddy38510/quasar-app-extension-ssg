const { relative } = require('path');
const { readFile } = require('fs/promises');
const { crc32 } = require('crc');

module.exports.compareSnapshots = function compareSnapshots(from, to) {
  const allKeys = Array.from(new Set([
    ...Object.keys(from).sort(),
    ...Object.keys(to).sort(),
  ]));

  let changed;

  allKeys.some((key) => {
    if (JSON.stringify(from[key]) !== JSON.stringify(to[key])) {
      changed = key;

      return true;
    }

    return false;
  });

  return changed;
};

module.exports.makeSnapshot = async function makeSnapshot({ globbyOptions, ignore, rootDir }) {
  const { globby } = await import('globby');
  const files = await globby('**', {
    ...globbyOptions,
    ignore,
    cwd: rootDir,
    absolute: true,
  });

  const snapshot = {};

  await Promise.all(files.map(async (p) => {
    const filepath = typeof p === 'object' ? p.path : p;
    const key = relative(rootDir, filepath);

    try {
      const fileContent = await readFile(filepath);
      snapshot[key] = {
        checksum: crc32(fileContent).toString(16),
      };
    } catch (e) {
      // TODO: Check for other errors like permission denied
      snapshot[key] = {
        exists: false,
      };
    }
  }));

  return snapshot;
};
