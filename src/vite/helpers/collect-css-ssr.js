/* eslint-disable no-underscore-dangle */
const { cssLangRE } = require('../plugins/vite.ssg');
const getHash = require('./get-hash');

const moduleIsStyle = (mod) => (
  (cssLangRE.test(mod.file) || mod.id?.includes('vue&type=style'))
  && mod.ssrModule
);

const collectCss = function collectCss(entryMod, renderedCompMods) {
  const seen = new Set();
  let styles = '';

  const processMod = (mod) => {
    if (!mod || seen.has(mod.id + mod.url)) {
      return;
    }

    seen.add(mod.id + mod.url);

    if (moduleIsStyle(mod)) {
      styles += `<style ssr-id="${getHash(mod.id)}">${mod.ssrModule.__module_css?.default || mod.ssrModule.default}</style>`;
    }

    if (mod.importedModules?.size > 0) {
      mod.importedModules.forEach(processMod);
    }
  };

  // process only styles directly imported from entry
  entryMod.importedModules.forEach(
    (mod) => {
      if (mod && moduleIsStyle(mod)) {
        processMod(mod);
      }
    },
  );

  // recursively process all modules from rendered components
  renderedCompMods.forEach(processMod);

  return styles;
};

module.exports = collectCss;
