/* eslint-disable no-console */
const {
  bgBlue, green, grey, underline,
} = require('chalk');
const path = require('path');
const requireFromApp = require('./require-from-app');
const { getPackageVersion, hasPackage } = require('./packages');

const quasarVersion = getPackageVersion('quasar');
const cliAppVersion = getPackageVersion('@quasar/app');
const ssgVersion = getPackageVersion('quasar-app-extension-ssg');

module.exports.build = function build(ctx, details) {
  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else {
    banner += ` ${bgBlue('================== BUILD ==================')} \n`;
  }

  banner += `
 Build mode........ ${green(ctx.modeName)}
 Pkg ssg........... ${green(`v${ssgVersion}`)}
 Pkg quasar........ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app... ${green(`v${cliAppVersion}`)}
 Debugging......... ${ctx.debug ? green('enabled') : grey('no')}`;

  if (details) {
    if (details.transpileBanner) {
      banner += `\n Transpiled JS..... ${details.transpileBanner}`;
    }
    banner += `
 ==================
 Output folder..... ${green(details.outputFolder)}`;
  }

  console.log(`${banner}\n`);

  if (!details && hasPackage('@quasar/app', '>=2.0.0')) {
    const { getBrowsersBanner } = requireFromApp('@quasar/app/lib/helpers/browsers-support');
    console.log(getBrowsersBanner());
  }
};

module.exports.generate = function generate(ctx, details) {
  let banner = '';

  if (!details) {
    banner += ` ${bgBlue('================ GENERATE =================')}`;
  } else {
    const relativeDistDir = path.posix.relative('', details.distDir);

    banner += `\n ${underline('Generate succeeded')}\n`;

    banner += `
 Pkg ssg........... ${green(`v${ssgVersion}`)}
 Pkg quasar........ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app... ${green(`v${cliAppVersion}`)}
 Debugging......... ${ctx.debug ? green('enabled') : grey('no')}
 SPA Fallback...... ${green(details.fallback)}
 ==================
 Output folder..... ${green(details.distDir)}

 Tip: You can use "$ quasar ssg serve ${relativeDistDir}" command to create
      a web server for testing. Type "$ quasar ssg serve -h" for parameters.

 Tip: If you are intending to deploy your app at a sub-path
      by setting "publicPath" in Quasar, you might use prefix-path parameter.
      "$ quasar ssg serve ${relativeDistDir} --prefix-path <publicPath>"`;
  }

  console.log(`${banner}\n`);
};
