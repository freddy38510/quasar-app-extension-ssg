const webpackConf = require('../webpack/conf.router');
const appRequire = require('../helpers/app-require');

class Router {
  constructor(quasarConf, webpackConfServerSide) {
    this.webpackConf = webpackConf(quasarConf, webpackConfServerSide);
  }

  build() {
    const webpack = appRequire('webpack');

    return new Promise((resolve) => {
      webpack(this.webpackConf, async () => resolve());
    });
  }
}

module.exports = Router;
