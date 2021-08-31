#!/usr/bin/env node
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
/* eslint-disable global-require */

const parseArgs = require('minimist');
const appRequire = require('../helpers/app-require');

const argv = parseArgs(process.argv.slice(4), {
  alias: {
    p: 'port',
    H: 'hostname',
    g: 'gzip',
    s: 'silent',
    colors: 'colors',
    o: 'open',
    c: 'cache',
    cors: 'cors',
    m: 'micro',
    https: 'https',
    C: 'cert',
    K: 'key',
    P: 'proxy',
    h: 'help',
  },
  boolean: ['g', 'https', 'colors', 'h', 'cors'],
  string: ['H', 'C', 'K', 'prefix-path'],
  default: {
    p: process.env.PORT || 4000,
    H: process.env.HOSTNAME || '0.0.0.0',
    g: true,
    c: 24 * 60 * 60,
    m: 1,
    colors: true,
    'prefix-path': '/',
  },
});
if (argv.help) {
  console.log(`
  Description
    Start a HTTP(S) server on a folder.

  Usage
    $ quasar ssg serve [path]
    $ quasar ssg serve . # serve current folder

  Options
    --port, -p              Port to use (default: 4000)
    --hostname, -H          Address to use (default: 0.0.0.0)
    --prefix-path           Create a virtual path prefix (default: /)
    --gzip, -g              Compress content (default: true)
    --silent, -s            Suppress log message
    --colors                Log messages with colors (default: true)
    --open, -o              Open browser window after starting
    --cache, -c <number>    Cache time (max-age) in seconds;
                            Does not apply to /service-worker.js
                            (default: 86400 - 24 hours)
    --micro, -m <seconds>   Use micro-cache (default: 1 second)

    --https                 Enable HTTPS
    --cert, -C [path]       Path to SSL cert file (Optional)
    --key, -K [path]        Path to SSL key file (Optional)
    --proxy <file.js>       Proxy specific requests defined in file;
                            File must export Array ({ path, rule })
                            See example below. "rule" is defined at:
                            https://github.com/chimurai/http-proxy-middleware
    --cors                  Enable CORS for all requests
    --help, -h              Displays this message

  Proxy file example
    module.exports = [
      {
        path: '/api',
        rule: { target: 'http://www.example.org' }
      }
    ]
    --> will be transformed into app.use(path, httpProxyMiddleware(rule))
  `);
  process.exit(0);
}

module.exports = (api) => {
  const fs = require('fs');
  const PlatformPath = require('path');
  const { sync: globbySync } = require('globby');

  function getAbsolutePath(pathParam) {
    return PlatformPath.isAbsolute(pathParam)
      ? pathParam
      : PlatformPath.join(process.cwd(), pathParam);
  }

  const root = getAbsolutePath(argv._[0] || '.');
  const resolve = (p) => PlatformPath.resolve(root, p);
  const prefixPath = PlatformPath.posix.join('/', argv['prefix-path']);

  let green; let grey; let
    red;

  if (argv.colors) {
    const chalk = require('chalk');
    green = chalk.green;
    grey = chalk.grey;
    red = chalk.red;
  } else {
    red = (text) => text;
    grey = red;
    green = grey;
  }

  const
    express = require('express');
  const microCacheSeconds = argv.micro
    ? parseInt(argv.micro, 10)
    : false;

  function serve(path, cache) {
    const opts = {
      maxAge: cache ? parseInt(argv.cache, 10) * 1000 : 0,
      setHeaders(res, filePath) {
        if (res.req.method === 'GET' && resolve(filePath).endsWith('.html')) {
          res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.set('Pragma', 'no-cache');
          res.set('Expires', '0');
          res.set('Surrogate-Control', 'no-store');
        }
      },
      extensions: ['html'],
    };

    return express.static(resolve(path), opts);
  }

  const app = express();

  if (argv.cors) {
    const cors = require('cors');
    app.use(cors());
  }

  if (!argv.silent) {
    app.get('*', (req, _, next) => {
      console.log(
        `GET ${green(req.url)} ${grey(`[${req.ip}]`)} ${new Date()}`,
      );
      next();
    });
  }

  if (argv.gzip) {
    const compression = require('compression');
    app.use(compression({ threshold: 0 }));
  }

  const serviceWorkerFile = resolve('service-worker.js');
  if (fs.existsSync(serviceWorkerFile)) {
    app.use(PlatformPath.posix.join(prefixPath, 'service-worker.js'), serve('service-worker.js'));
  }

  if (argv.proxy) {
    argv.proxy = getAbsolutePath(argv.proxy);
    let file = argv.proxy;

    if (!fs.existsSync(file)) {
      console.error(`Proxy definition file not found! ${file}`);
      process.exit(1);
    }
    file = require(file);

    const { createProxyMiddleware } = appRequire('http-proxy-middleware', api.appDir);
    file.forEach((entry) => {
      app.use(entry.path, createProxyMiddleware(entry.rule));
    });
  }

  app.use(prefixPath, serve('.', true));

  const fallbackFile = globbySync(resolve('./*.html'), { ignore: resolve('./index.html') })[0];
  if (fallbackFile) {
    app.use(prefixPath, (req, res, next) => {
      const ext = PlatformPath.posix.extname(req.url) || '.html';

      if (ext !== '.html') {
        return next();
      }

      res.setHeader('Content-Type', 'text/html');

      if (fallbackFile.endsWith('404.html')) {
        res.status(404);

        if (!argv.silent) {
          console.log(red(`  404 on ${req.url}`));
        }
      } else {
        res.status(200);
      }

      return res.sendFile(fallbackFile);
    });
  }

  if (microCacheSeconds) {
    const microcache = require('route-cache');
    app.use(
      microcache.cacheSeconds(
        microCacheSeconds,
        (req) => req.originalUrl,
      ),
    );
  }

  app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(404).send('404 | Page Not Found');
    if (!argv.silent) {
      console.log(red(`  404 on ${req.url}`));
    }
  });

  function getHostname(host) {
    return host === '0.0.0.0'
      ? 'localhost'
      : host;
  }

  function getServer() {
    if (!argv.https) {
      return app;
    }

    let fakeCert; let key; let
      cert;

    if (argv.key && argv.cert) {
      key = getAbsolutePath(argv.key);
      cert = getAbsolutePath(argv.cert);

      if (fs.existsSync(key)) {
        key = fs.readFileSync(key);
      } else {
        console.error(`SSL key file not found!${key}`);
        process.exit(1);
      }

      if (fs.existsSync(cert)) {
        cert = fs.readFileSync(cert);
      } else {
        console.error(`SSL cert file not found!${cert}`);
        process.exit(1);
      }
    } else {
      // Use a self-signed certificate if no certificate was configured.
      // Cycle certs every 24 hours
      const certPath = PlatformPath.join(__dirname, '../ssl-server.pem');
      let certExists = fs.existsSync(certPath);

      if (certExists) {
        const certStat = fs.statSync(certPath);
        const certTtl = 1000 * 60 * 60 * 24;
        const now = new Date();

        // cert is more than 30 days old
        if ((now - certStat.ctime) / certTtl > 30) {
          console.log(' SSL Certificate is more than 30 days old. Removing.');
          const { removeSync } = require('fs-extra');
          removeSync(certPath);
          certExists = false;
        }
      }

      if (!certExists) {
        console.log(' Generating self signed SSL Certificate...');
        console.log(' DO NOT use this self-signed certificate in production!');

        const selfsigned = require('selfsigned');
        const pems = selfsigned.generate(
          [{ name: 'commonName', value: 'localhost' }],
          {
            algorithm: 'sha256',
            days: 30,
            keySize: 2048,
            extensions: [{
              name: 'basicConstraints',
              cA: true,
            }, {
              name: 'keyUsage',
              keyCertSign: true,
              digitalSignature: true,
              nonRepudiation: true,
              keyEncipherment: true,
              dataEncipherment: true,
            }, {
              name: 'subjectAltName',
              altNames: [
                {
                  // type 2 is DNS
                  type: 2,
                  value: 'localhost',
                },
                {
                  type: 2,
                  value: 'localhost.localdomain',
                },
                {
                  type: 2,
                  value: 'lvh.me',
                },
                {
                  type: 2,
                  value: '*.lvh.me',
                },
                {
                  type: 2,
                  value: '[::1]',
                },
                {
                  // type 7 is IP
                  type: 7,
                  ip: '127.0.0.1',
                },
                {
                  type: 7,
                  ip: 'fe80::1',
                },
              ],
            }],
          },
        );

        try {
          fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
        } catch (err) {
          console.error(` Cannot write certificate file ${certPath}`);
          console.error(' Aborting...');
          process.exit(1);
        }
      }

      fakeCert = fs.readFileSync(certPath);
    }

    return require('https').createServer({
      key: key || fakeCert,
      cert: cert || fakeCert,
    }, app);
  }

  getServer().listen(argv.port, argv.hostname, () => {
    const url = `http${argv.https ? 's' : ''}://${getHostname(argv.hostname)}:${argv.port}`;
    const fullUrl = url + prefixPath;

    const info = [
      ['Listening at', url],
      prefixPath !== '/' ? ['Served at sub path', fullUrl] : '',
      ['Web server root', root],
      fallbackFile ? ['Fallback', PlatformPath.basename(fallbackFile)] : '',
      argv.https ? ['HTTPS', 'enabled'] : '',
      argv.gzip ? ['Gzip', 'enabled'] : '',
      ['Cache (max-age)', argv.cache || 'disabled'],
      microCacheSeconds ? ['Micro-cache', `${microCacheSeconds}s`] : '',
      argv.cors ? ['CORS', 'enabled'] : '',
      argv.proxy ? ['Proxy definitions', argv.proxy] : '',
    ]
      .filter((msg) => msg)
      .map((msg) => ` ${msg[0].padEnd(20, '.')} ${green(msg[1])}`);

    console.log(`\n${info.join('\n')}\n`);

    if (argv.open) {
      const ci = require('ci-info');

      const isMinimalTerminal = (
        ci.isCI
        || process.env.NODE_ENV === 'test'
        || !process.stdout.isTTY
      );
      if (!isMinimalTerminal) {
        require('open')(fullUrl, { url: true });
      }
    }
  });
};
