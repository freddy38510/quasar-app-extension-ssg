/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
const {
  redBright, green, grey, underline,
} = require('chalk');
const path = require('path');
const appRequire = require('./app-require');
const { hasBrowsersSupportFile } = require('./compatibility');

module.exports.build = function build(api, ctx, cmd, details) {
  // eslint-disable-next-line global-require
  const quasarVersion = api.getPackageVersion('quasar');
  const cliAppVersion = api.getPackageVersion('@quasar/app');

  let banner = '';

  if (details) {
    banner += ` ${underline('Build succeeded')}\n`;
  } else {
    banner += '\n ================== Build ================== \n';
  }

  banner += `
 Build mode........ ${green(ctx.modeName)}
 Pkg quasar........ ${green(`v${quasarVersion}`)}
 Pkg @quasar/app... ${green(`v${cliAppVersion}`)}
 Debugging......... ${cmd === 'dev' || ctx.debug ? green('enabled') : grey('no')}`;

  banner += `\n Publishing........ ${ctx.publish !== void 0 ? green('yes') : grey('no')}`;

  if (details) {
    banner += `\n Transpiled JS..... ${details.transpileBanner}`;
    banner += `
 ==================
 Output folder..... ${green(details.outputFolder)}`;
  }

  console.log(`${banner}\n`);

  if (!details && hasBrowsersSupportFile(api)) {
    const { getBrowsersBanner } = appRequire('@quasar/app/lib/helpers/browsers-support', api.appDir);
    console.log(getBrowsersBanner());
  }
};

module.exports.generate = function generate(options, errors) {
  let banner = '\n';

  if (!options) {
    banner += ' ================== Generate ==================';
  } else {
    const relativeDistDir = path.posix.relative('', options.__distDir);
    const hasErrors = errors.length > 0;

    const successMessage = ` ${underline('Generation succeeded')}`;

    const failMessage = ` ${underline('Generation failed')} with ${errors.length} error(s), check log above.\n`;

    banner += `${hasErrors ? ` ⚠️ ${redBright(failMessage)}` : successMessage}`;

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
