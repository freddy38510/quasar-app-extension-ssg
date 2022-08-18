/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
const extendQuasarConf = require('./extend-quasar-conf');
const requireFromApp = require('../helpers/require-from-app');
const { hasPackage } = require('../helpers/packages');

const hasNewQuasarConfFile = hasPackage('@quasar/app', '>=2.1.0');

const QuasarConfFile = requireFromApp(hasNewQuasarConfFile ? '@quasar/app/lib/quasar-conf-file' : '@quasar/app/lib/quasar-config');

module.exports = class ExtendedQuasarConfFile extends QuasarConfFile {
  constructor(ctx, opts = {}) {
    super(ctx, opts);

    // trick to not let Quasar create webpackConf
    this.webpackConfChanged = false;
  }

  get quasarConf() {
    if (hasNewQuasarConfFile) {
      return this.__quasarConf;
    }

    return this.buildConfig;
  }

  set quasarConf(cfg) {
    if (hasNewQuasarConfFile) {
      this.__quasarConf = cfg;

      return;
    }

    this.buildConfig = cfg;
  }

  async compile() {
    if (hasNewQuasarConfFile) {
      extendQuasarConf(this.sourceCfg);
    } else {
      extendQuasarConf(this.quasarConfig);
    }

    this.ctx.modeName = 'ssr';

    await super.compile();

    this.ctx.modeName = 'ssg';

    Object.assign(this.quasarConf.build.env, {
      MODE: this.ctx.modeName,
    });
  }

  async addWebpackConf() {
    delete this.webpackConfig;

    this.webpackConf = await require('../build/webpack')(this.quasarConf);
  }
};
