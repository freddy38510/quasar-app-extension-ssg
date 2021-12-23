const webpackConf = require('../webpack/conf.router');
const appRequire = require('../helpers/app-require');

class Router {
  constructor(api, quasarConf, webpackConfServerSide) {
    this.webpack = appRequire('webpack', api.appDir);
    this.webpackConf = webpackConf(api, quasarConf, webpackConfServerSide);
  }

  build() {
    return new Promise((resolve) => {
      this.webpack(this.webpackConf, async () => resolve());
    });
  }
}

module.exports = Router;
