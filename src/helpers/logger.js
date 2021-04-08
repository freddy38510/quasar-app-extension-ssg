/* eslint-disable no-console */
const { green, red, cyanBright } = require('chalk');

const banner = 'Extension(ssg) ·';

const logBanner = green(banner);
const warnBanner = red(banner);

module.exports.log = function log(msg) {
  console.log(msg ? ` ${logBanner} ${msg}` : '');
};

module.exports.warn = function warn(msg) {
  console.warn(msg ? ` ${warnBanner} ⚠️  ${msg}` : '');
};

module.exports.fatal = function fatal(msg) {
  console.error(msg ? ` ${warnBanner} ⚠️  ${msg}` : '');
  process.exit(1);
};

module.exports.routeBanner = function routeBanner(route, msg) {
  return msg ? ` ${logBanner} ${msg} ${cyanBright(route)}` : '';
};
