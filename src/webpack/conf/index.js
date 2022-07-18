/* eslint-disable global-require */
const extendQuasarConf = require('./extend-quasar-conf');
const requireFromApp = require('../helpers/require-from-app');

const QuasarConfFile = requireFromApp('@quasar/app/lib/quasar-conf-file');

function encode(obj) {
  return JSON.stringify(obj, (_, value) => (typeof value === 'function'
    ? `/fn(${value.toString()})`
    : value));
}

module.exports = class ExtendedQuasarConfFile extends QuasarConfFile {
  constructor(ctx, opts = {}) {
    super(ctx, opts);
  }

  async reboot() {
    const result = await super.reboot();

    if (this.webpackConfChanged !== false) {
      await this.addWebpackConf();
    }

    return result;
  }

  async compile() {
    const oldWatch = this.watch;

    extendQuasarConf(this.sourceCfg);

    this.webpackConfChanged = false;

    this.watch = false; // do not let Quasar set webpackConf prop

    this.ctx.modeName = 'ssr'; // needed to set publicPath correctly

    await super.compile();

    this.ctx.modeName = 'ssg';

    Object.assign(this.quasarConf.build.env, {
      MODE: this.ctx.modeName,
    });

    this.watch = oldWatch;

    // If watching for changes then determine the type of them (webpack or not).
    // The snapshot below should only contain webpack config:
    if (this.watch) {
      const cfg = this.sourceCfg;

      const newConfigSnapshot = [
        cfg.build ? encode(cfg.build) : '',
        cfg.ssr && cfg.ssr.pwa ? encode(cfg.ssr.pwa) : '',
        cfg.framework ? cfg.framework.autoImportComponentCase : '',
        cfg.devServer ? encode(cfg.devServer) : '',
        cfg.pwa ? encode(cfg.pwa) : '',
        cfg.htmlVariables ? encode(cfg.htmlVariables) : '',
      ].join('');

      if (this.oldConfigSnapshot) {
        this.webpackConfChanged = newConfigSnapshot !== this.oldConfigSnapshot;
      }

      this.oldConfigSnapshot = newConfigSnapshot;
    }
  }

  async addWebpackConf() {
    this.webpackConf = await require('../build/create-chain')(this.quasarConf);
  }
};
