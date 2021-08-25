/* eslint-disable no-console */
const {
  green, redBright, blueBright, yellowBright, bold,
} = require('chalk');
const isUnicodeSupported = require('./is-unicode-supported');

const banner = 'Extension(ssg) ·';
const pointer = isUnicodeSupported ? '❯' : '>';

const log = function log(msg) {
  console.log(msg ? ` ${green(banner)} ${msg}` : '');
};

const warn = function warn(msg) {
  console.warn(msg ? ` ${redBright(banner)} ⚠️  ${msg}` : '');
};

const fatal = function fatal(msg) {
  console.error(msg ? ` ${redBright(banner)} ⚠️  ${msg}` : '');
  process.exit(1);
};

const beastcssFormatMessage = (msg, level = null, indent = true) => {
  let prefix = indent ? `  ${pointer} ` : '';

  prefix = level ? `${prefix}[${level}]` : prefix;

  return `${prefix} ${bold('Beastcss')}: ${msg}`;
};

const logBeastcss = ({
  traces, debugs, infos, warns, errors,
}, indent) => {
  traces.forEach((msg) => log(blueBright(beastcssFormatMessage(msg, 'trace', indent))));
  debugs.forEach((msg) => log(blueBright(beastcssFormatMessage(msg, 'debug', indent))));
  warns.forEach((msg) => log(yellowBright(beastcssFormatMessage(msg, 'warn', indent))));
  errors.forEach((msg) => log(redBright(beastcssFormatMessage(msg, 'error', indent))));
  infos.forEach((msg) => log(blueBright(beastcssFormatMessage(msg, 'info', indent))));
};

module.exports = {
  log,
  warn,
  fatal,
  beastcssFormatMessage,
  logBeastcss,
};
