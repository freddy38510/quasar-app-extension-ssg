const { extname } = require('path');

const jsRE = /\.js$/;
const cssRE = /\.css$/;
const woffRE = /\.woff$/;
const woff2RE = /\.woff2$/;
const gifRE = /\.gif$/;
const jpgRE = /\.jpe?g$/;
const pngRE = /\.png$/;
const queryRE = /\?.*/;

function getFileType(ext) {
  if (ext === 'js' || ext === 'cjs' || ext === 'mjs') {
    return 'script';
  }

  if (ext === 'css') {
    return 'style';
  }

  if (/jpe?g|png|svg|gif|webp|ico/.test(ext)) {
    return 'image';
  }

  if (/woff2?|ttf|otf|eot/.test(ext)) {
    return 'font';
  }

  // not exhausting all possibilities here, but above covers common cases
  return '';
}

function normalizeFile(file) {
  const fileWithoutQuery = file.replace(queryRE, '');
  const extension = extname(fileWithoutQuery).slice(1);

  return { fileWithoutQuery, type: getFileType(extension), extension };
}

module.exports = function createRenderHintsTag(shouldPreload, shouldPrefetch) {
  return function renderHintsTag(file, isLazilyHydrated) {
    if (cssRE.test(file) === true) {
      // always preload css to avoid FOUC
      return `<link rel="stylesheet" href="${file}">`;
    }

    const methods = [];
    const { fileWithoutQuery, type, extension } = normalizeFile(file);

    if (shouldPreload({
      file: fileWithoutQuery, type, extension, isLazilyHydrated,
    })) {
      methods.push('preload');
    }

    if (shouldPrefetch({
      file: fileWithoutQuery, type, extension, isLazilyHydrated,
    })) {
      methods.push('prefetch');
    }

    if (methods.length === 0) {
      return '';
    }

    if (jsRE.test(file) === true) {
      return `<link rel="${methods.join(' ').replace('preload', 'modulepreload')}" as="script" href="${file}" crossorigin>`;
    }

    if (woffRE.test(file) === true) {
      return `<link rel="${methods.join(' ')}" href="${file}" as="font" type="font/woff" crossorigin>`;
    }

    if (woff2RE.test(file) === true) {
      return `<link rel="${methods.join(' ')}" href="${file}" as="font" type="font/woff2" crossorigin>`;
    }

    if (gifRE.test(file) === true) {
      return `<link rel="${methods.join(' ')}" href="${file}" as="image" type="image/gif">`;
    }

    if (jpgRE.test(file) === true) {
      return `<link rel="${methods.join(' ')}" href="${file}" as="image" type="image/jpeg">`;
    }

    if (pngRE.test(file) === true) {
      return `<link rel="${methods.join(' ')}" href="${file}" as="image" type="image/png">`;
    }

    return '';
  };
};
