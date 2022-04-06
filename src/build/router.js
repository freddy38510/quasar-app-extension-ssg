const webpackConf = require('../webpack/conf.router');
const requireFromApp = require('../helpers/require-from-app');

class Router {
  constructor(quasarConf, webpackConfServerSide) {
    this.webpackConf = webpackConf(quasarConf, webpackConfServerSide);
  }

  build() {
    const webpack = requireFromApp('webpack');

    return new Promise((resolve) => {
      webpack(this.webpackConf, async () => resolve());
    });
  }
}

module.exports = Router;
