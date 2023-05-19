/* eslint-disable no-void */
/* eslint-disable no-console */

const { requireFromApp } = require('../../api');
const {
  quasarVersion,
  cliAppVersion,
  ssgVersion,
  getCompilationTarget,
} = require('./banner-global');

const appPaths = requireFromApp('@quasar/app-vite/lib/app-paths');
const { green, dim } = requireFromApp('kolorist');

const greenBanner = green('»');
const cache = {};

function getIPList() {
  // expensive operation, so cache the response
  if (cache.ipList === void 0) {
    const { getIPs } = requireFromApp('@quasar/app-vite/lib/helpers/net');
    cache.ipList = getIPs().map((ip) => (ip === '127.0.0.1' ? 'localhost' : ip));
  }

  return cache.ipList;
}

function getBanner(quasarConf) {
  const { ctx } = quasarConf;

  const urlList = quasarConf.devServer.host === '0.0.0.0'
    ? getIPList().map((ip) => green(quasarConf.metaConf.getUrl(ip))).join('\n                           ')
    : green(quasarConf.metaConf.APP_URL);

  const banner = [
    ` ${greenBanner} Reported at............ ${dim(new Date().toLocaleDateString())} ${dim(new Date().toLocaleTimeString())}`,
    ` ${greenBanner} App dir................ ${green(appPaths.appDir)}`,
    ` ${greenBanner} App URL................ ${urlList}`,
    ` ${greenBanner} Dev mode............... ${green(ctx.modeName + (ctx.mode.pwa ? ' + pwa' : ''))}`,
    ` ${greenBanner} Pkg quasar............. ${green(`v${quasarVersion}`)}`,
    ` ${greenBanner} Pkg @quasar/app-vite... ${green(`v${cliAppVersion}`)}`,
    ` ${greenBanner} Pkg ssg................ ${green(`v${ssgVersion}`)}`,
    ` ${greenBanner} Browser target......... ${getCompilationTarget(quasarConf.build.target.browser)}`,
    ` ${greenBanner} Node target............ ${getCompilationTarget(quasarConf.build.target.node)}`,
  ];

  return banner.join('\n');
}

module.exports = (quasarConf) => {
  console.log();
  console.log(getBanner(quasarConf));
  console.log();
};
