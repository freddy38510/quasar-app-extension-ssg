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

const logBeastcss = (messages, level) => {
  messages.forEach(({ level: msgLevel, msg, color }) => {
    if (msgLevel === level) {
      console.log(`                  ${color(`${pointer} Beastcss: ${msg}`)}`);
    }
  });
};

module.exports = {
  log,
  warn,
  fatal,
  beastcssFormatMessage,
  logBeastcss,
};
