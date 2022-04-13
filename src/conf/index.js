/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
const extendQuasarConf = require('./extend-quasar-conf');
const requireFromApp = require('../helpers/require-from-app');
const appPaths = require('../helpers/app-paths');
const { error } = require('../helpers/logger');

const QuasarConfFile = requireFromApp('@quasar/app/lib/quasar-conf-file');

module.exports = class ExtendedQuasarConfFile extends QuasarConfFile {
  constructor({ prompts, hasPackage }, ctx, opts = {}) {
    super(ctx, opts);

    this.prompts = prompts;

    this.needSSRDirectives = hasPackage('@quasar/app', '< 3.4.0');

    // trick to not let Quasar create webpackConf
    this.webpackConfChanged = false;
  }

  async prepare() {
    if (this.needSSRDirectives) {
      // trick the load of the devland SSR Directives compiled file
      // to avoid error (missing compiled file) in case of skipped webpack compilation (cache usage)
      // the compiled file is loaded when calling addWebpackConf method
      this.ctx.mode.ssr = false;
    }

    await super.prepare();

    if (this.needSSRDirectives) {
      this.ctx.mode.ssr = true;
      this.sourceCfg.ctx.mode.ssr = true;
    }
  }

  async compile() {
    extendQuasarConf(this.sourceCfg, this.prompts);

    await super.compile();
  }

  async addWebpackConf() {
    if (this.needSSRDirectives) {
      const ssrDirectivesFile = appPaths.resolve.app('.quasar/ssr/compiled-directives.js');

      try {
        delete require.cache[ssrDirectivesFile];
        this.devlandSsrDirectives = require(ssrDirectivesFile).default;
      } catch (err) {
        error('Could not load the compiled file of devland SSR directives:\n', 'FAIL');
        console.log(err);
        console.log();
        process.exit(1);
      }

      this.quasarConf.directiveTransforms = {
        ...requireFromApp('quasar/dist/ssr-directives/index.js'),
        ...this.devlandSsrDirectives,
      };
    }

    this.webpackConf = await require('../build/webpack')(this.quasarConf);
  }
};
