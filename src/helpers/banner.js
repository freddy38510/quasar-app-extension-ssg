/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
const {
  redBright, yellowBright, green, grey, underline,
} = require('chalk');
const path = require('path');
const requireFromApp = require('./require-from-app');
const { getPackageVersion } = require('./packages');
const { hasBrowsersSupportFile } = require('./compatibility');

module.exports.build = function build(ctx, details) {
  const quasarVersion = getPackageVersion('quasar');
  const cliAppVersion = getPackageVersion('@quasar/app');
  const ssgVersion = getPackageVersion('quasar-app-extension-ssg');

  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else {
    banner += '\n ================== Build ================== \n';
  }

  banner += `
 Build mode........ ${green(ctx.modeName)}
 Pkg ssg........... ${green(`v${ssgVersion}`)}
 Pkg quasar........ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app... ${green(`v${cliAppVersion}`)}
 Debugging......... ${ctx.debug ? green('enabled') : grey('no')}`;

  if (details) {
    banner += `\n Transpiled JS..... ${details.transpileBanner}`;
    banner += `
 ==================
 Output folder..... ${green(details.outputFolder)}`;
  }

  console.log(`${banner}\n`);

  if (!details && hasBrowsersSupportFile) {
    const { getBrowsersBanner } = requireFromApp('@quasar/app/lib/helpers/browsers-support');
    console.log(getBrowsersBanner());
  }
};

module.exports.generate = function generate(options, errors, warnings) {
  let banner = '\n';

  if (!options) {
    banner += ' ================== Generate ==================';
  } else {
    const relativeDistDir = path.posix.relative('', options.__distDir);
    const hasErrors = errors.length > 0;
    const hasWarnings = warnings.length > 0;

    const successMessage = ` ${underline('Generation succeeded')}\n`;

    const successWithWarnsMessage = ` ${underline('Generation succeeded')}, but with ${warnings.length} warning(s). Check log above.\n`;

    const failMessage = ` ${underline('Generation failed')} with ${errors.length} error(s). Check log above.\n`;

    if (hasErrors) {
      banner += ` ⚠️ ${redBright(failMessage)}`;
    } else if (hasWarnings && !hasErrors) {
      banner += ` ⚠️ ${yellowBright(successWithWarnsMessage)}`;
    } else {
      banner += `${successMessage}`;
    }

    banner += `
 Fallback.......... ${green(options.fallback)}
 Output folder..... ${green(options.__distDir)}`;
    banner += `

 Tip: You can use "$ quasar ssg serve ${relativeDistDir}" command to create
      a web server for testing. Type "$ quasar ssg serve -h" for parameters.

 Tip: If you are intending to deploy your app at a sub-path
      by setting "publicPath" in Quasar, you might use prefix-path parameter.
      "$ quasar ssg serve ${relativeDistDir} --prefix-path <publicPath>"`;
  }

  console.log(`${banner}\n`);
};
