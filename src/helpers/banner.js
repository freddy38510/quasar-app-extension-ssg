/* eslint-disable no-console */
const {
  green, grey, bgBlue, underline,
} = require('chalk');
const path = require('path');
const requireFromApp = require('./require-from-app');

module.exports.logBuildBanner = function logBuildBanner(
  { getPackageVersion, hasPackage },
  argv,
  details,
) {
  const quasarVersion = getPackageVersion('quasar');
  const cliAppVersion = getPackageVersion('@quasar/app');
  const ssgVersion = getPackageVersion('quasar-app-extension-ssg');
  const hasNewQuasarPkg = hasPackage('@quasar/app', '>=3.4.0');

  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else {
    banner += ` ${bgBlue('================== BUILD ==================')} \n`;
  }

  banner += `
 ${hasNewQuasarPkg ? 'Build mode................' : 'Build mode........'} ${green('ssg')}
 ${hasNewQuasarPkg ? 'Pkg ssg...................' : 'Pkg ssg...........'} ${green(`v${ssgVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg quasar................' : 'Pkg quasar........'} ${green(`v${quasarVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg @quasar/app-webpack...' : 'Pkg @quasar/app...'} ${green(`v${cliAppVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg webpack...............' : 'Pkg webpack.......'} ${green('v5')}
 ${hasNewQuasarPkg ? 'Debugging.................' : 'Debugging.........'} ${argv.debug ? green('enabled') : grey('no')}`;

  if (details) {
    banner += `\n ${hasNewQuasarPkg ? 'Transpiled JS.............' : 'Transpiled JS.....'} ${details.transpileBanner}`;
    banner += `
 ${hasNewQuasarPkg ? '==========================' : '=================='}
 ${hasNewQuasarPkg ? 'Output folder.............' : 'Output folder.....'} ${green(details.outputFolder)}`;
  } else {
    banner += '\n';
  }

  console.log(`${banner}`);

  if (!details) {
    const { getBrowsersBanner } = requireFromApp('@quasar/app/lib/helpers/browsers-support');
    console.log(getBrowsersBanner());
  }
};

module.exports.logGenerateBanner = function logGenerateBanner(
  { getPackageVersion, hasPackage },
  ctx,
  details,
) {
  const quasarVersion = getPackageVersion('quasar');
  const cliAppVersion = getPackageVersion('@quasar/app');
  const ssgVersion = getPackageVersion('quasar-app-extension-ssg');

  let banner = '';

  if (details) {
    const relativeOutputFolder = path.posix.relative('', details.outputFolder);
    const hasNewQuasarPkg = hasPackage('@quasar/app', '>=3.4.0');

    banner += `\n ${underline('Generate succeeded')}\n`;

    banner += `
 ${hasNewQuasarPkg ? 'Pkg ssg...................' : 'Pkg ssg...........'} ${green(`v${ssgVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg quasar................' : 'Pkg quasar........'} ${green(`v${quasarVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg @quasar/app-webpack...' : 'Pkg @quasar/app...'} ${green(`v${cliAppVersion}`)}
 ${hasNewQuasarPkg ? 'Debugging.................' : 'Debugging.........'} ${ctx.debug ? green('enabled') : grey('no')}
 ${hasNewQuasarPkg ? 'SPA fallback..............' : 'SPA fallback......'} ${green(details.fallback)}
 ${hasNewQuasarPkg ? '==========================' : '=================='}
 ${hasNewQuasarPkg ? 'Output folder.............' : 'Output folder.....'} ${green(details.outputFolder)}

 Tip: You can use "$ quasar ssg serve ${relativeOutputFolder}" command to create
      a static web server for testing. Type "$ quasar ssg serve -h" for parameters.`;
  } else {
    banner += `\n ${bgBlue('================ GENERATE =================')}`;
  }

  console.log(`${banner}\n`);
};
