/* eslint-disable no-console */

const path = require('path');
const { requireFromApp, getPackageVersion } = require('../../api');

const {
  green,
  grey,
  bgBlue,
  underline,
  bold,
} = requireFromApp('chalk');

const quasarVersion = getPackageVersion('quasar');
const cliAppVersion = getPackageVersion('@quasar/app-webpack');
const ssgVersion = getPackageVersion('quasar-app-extension-ssg');

module.exports.logBuildBanner = function logBuildBanner(argv, cmd, details) {
  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else if (cmd !== 'dev') {
    banner += ` ${bgBlue('================== BUILD ==================')} \n`;
  }

  banner += `
 ${cmd === 'dev' ? 'Dev mode..................' : 'Build mode................'} ${green('ssg')}
 Pkg ssg................... ${green(`v${ssgVersion}`)}
 Pkg quasar................ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app-webpack... ${green(`v${cliAppVersion}`)}
 Pkg webpack............... ${green('v5')}
 Debugging................. ${cmd === 'dev' || argv.debug ? green('enabled') : grey('no')}`;

  if (details) {
    banner += `\n 'Transpiled JS............. ${details.transpileBanner}`;
    banner += `
 ==========================
 Output folder............. ${green(details.outputFolder)}`;
  } else {
    banner += '\n';
  }

  console.log(`${banner}`);

  if (!details) {
    const { getBrowsersBanner } = requireFromApp('@quasar/app-webpack/lib/helpers/browsers-support');
    console.log(getBrowsersBanner());
  }
};

module.exports.logGenerateBanner = function logGenerateBanner(ctx, details) {
  let banner = '';

  if (details) {
    const relativeOutputFolder = path.posix.relative('', details.outputFolder);

    banner += `\n ${underline('Generate succeeded')}\n`;

    banner += `
 Pkg ssg................... ${green(`v${ssgVersion}`)}
 Pkg quasar................ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app-webpack... ${green(`v${cliAppVersion}`)}
 Debugging................. ${ctx.debug ? green('enabled') : grey('no')}
 SPA fallback.............. ${green(details.fallback)}
 ==========================
 Output folder............. ${green(details.outputFolder)}

 Tip: You can use the "${bold(`$ quasar ssg serve ${relativeOutputFolder}`)}" command
      to create a static web server for testing.

      Type "$ quasar ssg serve -h" for parameters.`;
  } else {
    banner += `\n ${bgBlue('================ GENERATE =================')}`;
  }

  console.log(`${banner}\n`);
};

module.exports.quasarVersion = quasarVersion;
module.exports.cliAppVersion = cliAppVersion;
module.exports.ssgVersion = ssgVersion;
