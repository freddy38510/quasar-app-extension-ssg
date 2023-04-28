const { requireFromApp, hasPackage } = require('./packages');
const extendPrettyPageHandler = require('./extend-pretty-page-handler');
const { log, warn } = require('./logger');

const strip = requireFromApp('strip-ansi');

function cleanStack(stack) {
  return stack
    .split(/\n/g)
    .filter((l) => /^\s*at/.test(l))
    .join('\n');
}

function prepareError(err) {
  // only copy the information we need and avoid serializing unnecessary
  // properties, since some errors may attach full objects (e.g. PostCSS)
  return {
    message: strip(err.message),
    stack: strip(cleanStack(err.stack || '')),
    id: err.id,
    frame: strip(err.frame || ''),
    plugin: err.plugin,
    pluginCode: err.pluginCode,
    loc: err.loc,
  };
}

function createOuchInstance() {
  const Ouch = requireFromApp('ouch');

  Ouch.handlers.PrettyPageHandler = extendPrettyPageHandler(Ouch.handlers.PrettyPageHandler);

  return new Ouch().pushHandler(
    new Ouch.handlers.PrettyPageHandler('orange', null, 'sublime'),
  );
}

module.exports = function getDevErrorRenderer(server) {
  let ouchInstance;

  // vite below v2.7.8 does not export "ErrorOverlay"
  if (hasPackage('vite', '< 2.7.8') || server.config.server.hmr?.overlay === false) {
    ouchInstance = createOuchInstance();
  }

  return function renderError({ err, req, res }) {
    if (ouchInstance) {
      ouchInstance.handleException(err.cause || err, req, res, () => {
        log();
        warn(req.url, 'Render failed');
      });

      return;
    }

    res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Error</title>
            <script type="module">
              import { ErrorOverlay } from '/@vite/client'
              document.body.appendChild(new ErrorOverlay(${JSON.stringify(prepareError(err.cause || err)).replace(/</g, '\\u003c')}))
            </script>
          </head>
          <body>
          </body>
        </html>
      `);

    log();
    warn(req.url, 'Render failed');
  };
};
