/* eslint-disable global-require */
const extendQuasarConf = require('./extend-quasar-conf');
const requireFromApp = require('../helpers/require-from-app');

const QuasarConfFile = requireFromApp('@quasar/app/lib/quasar-conf-file');

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
    extendQuasarConf(this.sourceCfg);

    this.webpackConfChanged = false;

    this.ctx.modeName = 'ssr';

    await super.compile();

    this.ctx.modeName = 'ssg';

    Object.assign(this.quasarConf.build.env, {
      MODE: this.ctx.modeName,
    });
  }

  async addWebpackConf() {
    this.webpackConf = await require('../build/webpack')(this.quasarConf);
  }
};
