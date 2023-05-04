/* eslint-disable no-void */
/* eslint-disable no-console */

const { requireFromApp } = require('../../api');

const logger = requireFromApp('@quasar/app-vite/lib/helpers/logger');
const {
  cyan, yellow, bgYellow, black,
} = requireFromApp('kolorist');

const dot = '•';
const banner = `App ${dot}`;
const yellowBanner = yellow(banner);

const warningPill = (msg) => bgYellow(black(` ${msg} `));

module.exports = { ...logger };

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
