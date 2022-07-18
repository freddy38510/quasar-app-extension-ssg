/* eslint-disable no-console */
const {
  green, grey, bgBlue, underline,
} = require('chalk');
const path = require('path');
const requireFromApp = require('./require-from-app');
const { getPackageVersion, hasNewQuasarPkg } = require('./packages');

const quasarVersion = getPackageVersion('quasar');
const cliAppVersion = getPackageVersion('@quasar/app');
const ssgVersion = getPackageVersion('quasar-app-extension-ssg');

module.exports.logBuildBanner = function logBuildBanner(argv, cmd, details) {
  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else if (cmd !== 'dev') {
    banner += ` ${bgBlue('================== BUILD ==================')} \n`;
  }

  const getModeString = () => {
    if (cmd === 'dev') {
      return hasNewQuasarPkg ? 'Dev mode..................' : 'Dev mode..........';
    }

    return hasNewQuasarPkg ? 'Build mode................' : 'Build mode........';
  };

  banner += `
 ${getModeString()} ${green('ssg')}
 ${hasNewQuasarPkg ? 'Pkg ssg...................' : 'Pkg ssg...........'} ${green(`v${ssgVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg quasar................' : 'Pkg quasar........'} ${green(`v${quasarVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg @quasar/app-webpack...' : 'Pkg @quasar/app...'} ${green(`v${cliAppVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg webpack...............' : 'Pkg webpack.......'} ${green('v5')}
 ${hasNewQuasarPkg ? 'Debugging.................' : 'Debugging.........'} ${cmd === 'dev' || argv.debug ? green('enabled') : grey('no')}`;

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

module.exports.logGenerateBanner = function logGenerateBanner(ctx, details) {
  let banner = '';

  if (details) {
    const relativeOutputFolder = path.posix.relative('', details.outputFolder);

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

module.exports.quasarVersion = quasarVersion;
module.exports.cliAppVersion = cliAppVersion;
module.exports.ssgVersion = ssgVersion;
