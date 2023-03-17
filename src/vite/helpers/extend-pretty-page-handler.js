/* eslint-disable no-underscore-dangle */
const os = require('os');
const url = require('url');
const appPaths = require('../app-paths');

module.exports = function extendPrettyPageHandler(PrettyPageHandler) {
  PrettyPageHandler.prototype.__getServerAndRequestInfo = function __getServerAndRequestInfo() {
    const req = this.__request;

    if (req === null) {
      return {};
    }

    return {
      REMOTE_ADDR: (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress,
      REMOTE_PORT: req.connection.remotePort,
      SERVER_SOFTWARE: `NodeJS ${process.versions.node} ${os.type()}`,
      SERVER_PROTOCOL: `${this.__getRequestProtocol()}/${req.httpVersion}`,
      REQUEST_URI: req.url,
      REQUEST_METHOD: req.method,
      /**
       * ensure to correctly access the main module that may be missing
       * when using @quasar/cli v2.0.0 because its entry point is not a CommonJS module
       *
       * @see https://nodejs.org/api/modules.html#accessing-the-main-module
       *
       * fallback to env variable then @quasar/app-vite main script
       */
      SCRIPT_FILE: require.main?.filename || process.env._ || appPaths.resolve.appNodeModule('@quasar/app-vite/bin/quasar'),
      PATH_INFO: url.parse(req.url).pathname,
      QUERY_STRING: url.parse(req.url).query,
      HTTP_HOST: req.headers.host,
      HTTP_CONNECTION: req.headers.connection,
      HTTP_CACHE_CONTROL: req.headers['cache-control'],
      HTTP_ACCEPT: req.headers.accept,
      HTTP_USER_AGENT: req.headers['user-agent'],
      HTTP_DNT: req.headers.dnt,
      HTTP_ACCEPT_ENCODING: req.headers['accept-encoding'],
      HTTP_ACCEPT_LANGUAGE: req.headers['accept-language'],
      HTTP_COOKIE: req.headers.cookie,
    };
  };

  return PrettyPageHandler;
};
