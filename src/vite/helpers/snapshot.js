const { crc32 } = require('crc');
const fs = require('fs-extra');
const path = require('path');
const esmRequire = require('jiti')(__filename);

const { globby } = esmRequire('globby');

const compareSnapshots = function compareSnapshots(from, to) {
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

const makeSnapshot = async function makeSnapshot({ globbyOptions, ignore, rootDir }) {
  const snapshot = {};

  const files = await globby('**', {
    ...globbyOptions,
    ignore,
    cwd: rootDir,
    absolute: true,
  });

  await Promise.all(files.map(async (p) => {
    const key = path.relative(rootDir, p);
    try {
      const fileContent = await fs.readFile(p);
      snapshot[key] = {
        checksum: await crc32(fileContent).toString(16),
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

module.exports = {
  makeSnapshot,
  compareSnapshots,
};
