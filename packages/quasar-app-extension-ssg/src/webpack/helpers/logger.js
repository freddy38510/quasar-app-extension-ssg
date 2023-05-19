/* eslint-disable no-void */
/* eslint-disable no-console */

const isUnicodeSupported = require('./is-unicode-supported');
const { requireFromApp } = require('../../api');

const readline = requireFromApp('readline');

const {
  bgGreen, green,
  red, bgRed,
  bgYellow, yellow,
  inverse,
} = requireFromApp('chalk');

const dot = '•';
const pointer = isUnicodeSupported ? '❯' : '>';
const banner = `App ${dot}`;
const greenBanner = green(banner);
const redBanner = red(banner);
const yellowBanner = yellow(banner);

const successPill = (msg) => bgGreen.black('', msg, '');
const infoPill = (msg) => inverse('', msg, '');
const errorPill = (msg) => bgRed.white('', msg, '');
const warningPill = (msg) => bgYellow.black('', msg, '');

module.exports.clearConsole = process.stdout.isTTY
  ? () => {
    // Fill screen with blank lines. Then move to 0 (beginning of visible part) and clear it
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
  }
  : () => { };

module.exports.log = function log(msg) {
  console.log(msg ? ` ${greenBanner} ${msg}` : '');
};

module.exports.warn = function warn(msg, pill) {
  if (msg !== void 0) {
    const pillBanner = pill !== void 0
      ? `${bgYellow.black('', pill, '')} `
      : '';

    console.warn(` ${yellowBanner} ⚠️  ${pillBanner}${msg}`);
  } else {
    console.warn();
  }
};

module.exports.fatal = function fatal(msg, pill) {
  if (msg !== void 0) {
    const pillBanner = pill !== void 0
      ? `${errorPill(pill)} `
      : '';

    console.error(`\n ${redBanner} ⚠️  ${pillBanner}${msg}\n`);
  } else {
    console.error();
  }

  process.exit(1);
};

/**
 * Extended approach - Generation status & pills
 */

module.exports.successPill = successPill;
module.exports.success = function success(msg, title = 'SUCCESS') {
  console.log(` ${greenBanner} ${successPill(title)} ${green(`${dot} ${msg}`)}`);
};
module.exports.getSuccess = function getSuccess(msg, title) {
  return ` ${greenBanner} ${successPill(title)} ${green(`${dot} ${msg}`)}`;
};

module.exports.infoPill = infoPill;
module.exports.info = function info(msg, title = 'INFO') {
  console.log(` ${greenBanner} ${infoPill(title)} ${green(dot)} ${msg}`);
};
module.exports.getInfo = function getInfo(msg, title) {
  return ` ${greenBanner} ${infoPill(title)} ${green(dot)} ${msg}`;
};

module.exports.errorPill = errorPill;
module.exports.error = function error(msg, title = 'ERROR') {
  console.log(` ${redBanner} ${errorPill(title)} ${red(`${dot} ${msg}`)}`);
};
module.exports.getError = function getError(msg, title = 'ERROR') {
  return ` ${redBanner} ${errorPill(title)} ${red(`${dot} ${msg}`)}`;
};

module.exports.warningPill = warningPill;
module.exports.warning = function warning(msg, title = 'WARNING') {
  console.log(` ${yellowBanner} ${warningPill(title)} ${yellow(`${dot} ${msg}`)}`);
};
module.exports.getWarning = function getWarning(msg, title = 'WARNING') {
  return ` ${yellowBanner} ${warningPill(title)} ${yellow(`${dot} ${msg}`)}`;
};

module.exports.beastcssLog = function beastcssLog(messages, level) {
  if (!Array.isArray(messages)) {
    return;
  }

  messages.forEach(({ level: msgLevel, msg, color }) => {
    if (msgLevel === level) {
      console.log(`        ${color(`${pointer} Beastcss: ${msg}`)}`);
    }
  });
};
