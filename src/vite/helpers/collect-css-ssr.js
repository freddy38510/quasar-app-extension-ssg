/* eslint-disable no-underscore-dangle */
const parseViteRequest = require('./parse-vite-request');

const getHash = require('./get-hash');

const moduleIsStyle = (id) => {
  const { is } = parseViteRequest(id);

  return is.style();
};

const collectCss = function collectCss(entryMod, renderedCompMods) {
  let styles = '';

  if (!entryMod) {
    return styles;
  }

  const seen = new Set();

  const processMod = (mod) => {
    if (!mod || seen.has(mod.id + mod.url)) {
      return;
    }

    seen.add(mod.id + mod.url);

    if (mod.ssrModule && moduleIsStyle(mod.id)) {
      styles += `<style ssr-id="${getHash(mod.id)}">${mod.ssrModule.__module_css?.default || mod.ssrModule.default}</style>`;
    }

    if (mod.importedModules?.size > 0) {
      mod.importedModules.forEach(processMod);
    }
  };

  // process only styles directly imported from entry
  entryMod.importedModules.forEach(
    (mod) => {
      if (mod && moduleIsStyle(mod.id)) {
        processMod(mod);
      }
    },
  );

  // recursively process all modules from rendered components
  renderedCompMods.forEach(processMod);

  return styles;
};

module.exports = collectCss;
