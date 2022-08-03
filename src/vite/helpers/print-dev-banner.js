/* eslint-disable no-console */

const { requireFromApp } = require('./packages');
const appPaths = require('../app-paths');
const {
  quasarVersion, cliAppVersion, ssgVersion, getCompilationTarget,
} = require('./banner-global');

const { green, dim } = requireFromApp('kolorist');

const greenBanner = green('»');

function getBanner(quasarConf) {
  const { ctx } = quasarConf;

  const banner = [
    ` ${greenBanner} Reported at............ ${dim(new Date().toLocaleDateString())} ${dim(new Date().toLocaleTimeString())}`,
    ` ${greenBanner} App dir................ ${green(appPaths.appDir)}`,
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
