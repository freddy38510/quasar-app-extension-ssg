const webpackConf = require('./webpack/router/conf.router');
const requireFromApp = require('../helpers/require-from-app');

class Router {
  constructor(api, quasarConf, webpackConfServerSide) {
    this.webpack = requireFromApp('webpack');
    this.webpackConf = webpackConf(api, quasarConf, webpackConfServerSide);
  }

  build() {
    return new Promise((resolve) => {
      this.webpack(this.webpackConf, async () => resolve());
    });
  }
}

module.exports = Router;
