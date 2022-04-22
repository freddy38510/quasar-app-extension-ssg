/* eslint-disable no-console */
const { green, red, yellow } = require('chalk');
const isUnicodeSupported = require('./is-unicode-supported');

const banner = 'App ·';
const pointer = isUnicodeSupported ? '❯' : '>';

const log = function log(msg) {
  console.log(msg ? ` ${green(banner)} ${msg}` : '');
};

const warn = function warn(msg) {
  console.warn(msg ? yellow(` ${banner} ⚠️  ${msg}`) : '');
};

const error = function error(msg) {
  console.error(msg ? red(` ${banner} ${msg}`) : '');
};

const fatal = function fatal(msg) {
  console.error(msg ? red(` ${banner} ⚠️  ${msg}`) : '');
  process.exit(1);
};

const logBeastcss = (messages, level) => {
  messages.forEach(({ level: msgLevel, msg, color }) => {
    if (msgLevel === level) {
      console.log(`        ${color(`${pointer} beastcss - ${msg}`)}`);
    }
  });
};

module.exports = {
  log,
  warn,
  error,
  fatal,
  logBeastcss,
};
