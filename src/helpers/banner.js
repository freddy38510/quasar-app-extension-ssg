/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
const {
  green, grey, bgBlue, underline,
} = require('chalk');
const path = require('path');
const appRequire = require('./app-require');

module.exports.build = function build(api, ctx, cmd, details) {
  const quasarVersion = api.getPackageVersion('quasar');
  const cliAppVersion = api.getPackageVersion('@quasar/app');
  const ssgVersion = api.getPackageVersion('quasar-app-extension-ssg');

  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else {
    banner += `\n ${bgBlue('================== BUILD ==================')} \n`;
  }

  const hasNewQuasarPkg = api.hasPackage('@quasar/app', '<3.4.0');

  banner += `
 ${hasNewQuasarPkg ? 'Build mode................' : 'Build mode........'} ${green(ctx.modeName)}
 ${hasNewQuasarPkg ? 'Pkg ssg...................' : 'Pkg ssg...........'} ${green(`v${ssgVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg quasar................' : 'Pkg quasar........'} ${green(`v${quasarVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg @quasar/app-webpack...' : 'Pkg @quasar/app...'} ${green(`v${cliAppVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg webpack...............' : 'Pkg webpack.......'} ${green('v5')}
 ${hasNewQuasarPkg ? 'Debugging.................' : 'Debugging.........'} ${cmd === 'dev' || ctx.debug ? green('enabled') : grey('no')}`;

  if (details) {
    banner += `\n Transpiled JS..... ${details.transpileBanner}`;
    banner += `
 ${hasNewQuasarPkg ? '==========================' : '=================='}
 ${hasNewQuasarPkg ? 'Output folder.............' : 'Output folder.....'} ${green(details.outputFolder)}`;
  }

  console.log(`${banner}\n`);

  if (!details) {
    const { getBrowsersBanner } = appRequire('@quasar/app/lib/helpers/browsers-support');
    console.log(getBrowsersBanner());
  }
};

module.exports.generate = function generate(api, ctx, cmd, details) {
  const quasarVersion = api.getPackageVersion('quasar');
  const cliAppVersion = api.getPackageVersion('@quasar/app');
  const ssgVersion = api.getPackageVersion('quasar-app-extension-ssg');

  let banner = '';

  if (details) {
    const relativeOutputFolder = path.posix.relative('', details.outputFolder);

    banner += `\n ${underline('Generate succeeded')}\n`;

    const hasNewQuasarPkg = api.hasPackage('@quasar/app', '<3.4.0');

    banner += `
 ${hasNewQuasarPkg ? 'Pkg ssg...................' : 'Pkg ssg...........'} ${green(`v${ssgVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg quasar................' : 'Pkg quasar........'} ${green(`v${quasarVersion}`)}
 ${hasNewQuasarPkg ? 'Pkg @quasar/app-webpack...' : 'Pkg @quasar/app...'} ${green(`v${cliAppVersion}`)}
 ${hasNewQuasarPkg ? 'Debugging.................' : 'Debugging.........'} ${cmd === 'dev' || ctx.debug ? green('enabled') : grey('no')}
 ${hasNewQuasarPkg ? 'SPA fallback..............' : 'SPA fallback......'} ${green(details.fallback)}
 ${hasNewQuasarPkg ? '==========================' : '=================='}
 ${hasNewQuasarPkg ? 'Output folder.............' : 'Output folder.....'} ${green(details.outputFolder)}

 Tip: You can use "$ quasar ssg serve ${relativeOutputFolder}" command to create
      a static web server for testing. Type "$ quasar ssg serve -h" for parameters.`;
  } else {
    banner += `\n ${bgBlue('================== GENERATE ==================')}`;
  }

  console.log(`${banner}\n`);
};
