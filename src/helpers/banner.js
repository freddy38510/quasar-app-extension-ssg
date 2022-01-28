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

  banner += `
 Build mode........ ${green(ctx.modeName)}
 Pkg ssg........... ${green(`v${ssgVersion}`)}
 Pkg quasar........ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app... ${green(`v${cliAppVersion}`)}
 Pkg webpack....... ${green('v5')}
 Debugging......... ${cmd === 'dev' || ctx.debug ? green('enabled') : grey('no')}`;

  if (details) {
    banner += `\n Transpiled JS..... ${details.transpileBanner}`;
    banner += `
 ==================
 Output folder..... ${green(details.outputFolder)}`;
  }

  console.log(`${banner}`);

  if (!details) {
    const { getBrowsersBanner } = appRequire('@quasar/app/lib/helpers/browsers-support', api.appDir);
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

    banner += `
 Pkg ssg........... ${green(`v${ssgVersion}`)}
 Pkg quasar........ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app... ${green(`v${cliAppVersion}`)}
 Debugging......... ${cmd === 'dev' || ctx.debug ? green('enabled') : grey('no')}`;

    banner += `\n SPA fallback...... ${green(details.fallback)}`;

    banner += `
 ==================
 Output folder..... ${green(details.outputFolder)}`;
    banner += `

 Tip: You can use "$ quasar ssg serve ${relativeOutputFolder}" command to create
      a static web server for testing. Type "$ quasar ssg serve -h" for parameters.`;
  } else {
    banner += `\n ${bgBlue('================== GENERATE ==================')}`;
  }

  console.log(`${banner}\n`);
};
