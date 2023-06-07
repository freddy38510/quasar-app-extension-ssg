const {
  cyan, yellow, bgYellow, black,
} = require('kolorist');
const logger = require('@quasar/app-vite/lib/helpers/logger');

module.exports.dot = logger.dot;
module.exports.clearConsole = logger.clearConsole;
module.exports.log = logger.log;
module.exports.fatal = logger.fatal;
module.exports.info = logger.info;
module.exports.progress = logger.progress;

/**
 * Pills
 */

const warningPill = (msg) => bgYellow(black(` ${msg} `));

/**
 * Main approach - App CLI related
 */

const banner = `App ${logger.dot}`;
const yellowBanner = yellow(banner);

module.exports.beastcssLog = function beastcssLog(messages, level) {
  if (!Array.isArray(messages)) {
    return;
  }

  const color = level === 'info' ? cyan : yellow;

  messages.forEach(({ level: msgLevel, msg }) => {
    if (msgLevel === level) {
      logger[level](color(`[Beastcss] ${msg}`));
    }
  });
};

module.exports.warn = function warn(msg, pill) {
  if (msg !== void 0) {
    const pillBanner = pill !== void 0
      ? `${warningPill(pill)} `
      : '';

    console.warn(` ${yellowBanner} ⚠️  ${pillBanner}${msg}`);
  } else {
    console.warn();
  }
};
