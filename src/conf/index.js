/* eslint-disable global-require */
const extendQuasarConf = require('./extend-quasar-conf');
const requireFromApp = require('../helpers/require-from-app');

const QuasarConfFile = requireFromApp('@quasar/app/lib/quasar-conf-file');

module.exports = class ExtendedQuasarConfFile extends QuasarConfFile {
  constructor(ctx, opts = {}) {
    super(ctx, opts);

    // trick to not let Quasar create webpackConf
    this.webpackConfChanged = false;
  }

  async compile() {
    extendQuasarConf(this.sourceCfg);

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
