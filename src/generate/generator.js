/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Beastcss = require('beastcss');
const fs = require('fs').promises;
const { minify } = require('html-minifier');
const path = require('path');
const { parse } = require('node-html-parser');
const fastq = require('fastq');
const { cyanBright } = require('chalk');
const { log, warn, logBeastcss } = require('../helpers/logger');
const promisifyRoutes = require('../helpers/promisify-routes');
const { appDir } = require('../helpers/app-paths');
const isRouteValid = require('../helpers/is-route-valid');
const flatRoutes = require('../helpers/flat-routes');
const {
  withTrailingSlash,
  withoutTrailingSlash,
} = require('../helpers/normalize-slash');

class Generator {
  constructor(api, quasarConf, ctx) {
    const renderer = require(`${quasarConf.ssg.buildDir}/renderer`);

    renderer.mergeRendererOptions(quasarConf.ssg.rendererOptions);

    this.renderer = renderer;

    this.api = api;

    this.options = {
      ...quasarConf.ssg,
      minify: quasarConf.build.minify
        ? {
          ...quasarConf.__html.minifyOptions,
          ignoreCustomComments: [/^(\]?|\[?)$/], // avoid client-side hydration error
          conservativeCollapse: true, // avoid client-side hydration error
          minifyCSS: true,
        } : false,
      build: {
        publicPath: quasarConf.build.publicPath,
      },
      vueRouterBase: quasarConf.build.vueRouterBase,
      sourceFiles: quasarConf.sourceFiles,
      failOnError: ctx.failOnError,
      debug: ctx.debug,
    };

    this.generatedRoutes = new Set();

    if (this.options.inlineCriticalCss) {
      const manifest = require(path.join(
        quasarConf.ssg.buildDir,
        '/quasar.client-manifest.json',
      ));

      this.beastcss = new Beastcss(
        {
          noscriptFallback: false,
          logLevel: ctx.debug ? 'debug' : 'info',
          ...quasarConf.ssg.inlineCriticalCss || {},
          path: this.options.__distDir,
          publicPath: this.options.build.publicPath,
          additionalStylesheets: manifest.async,
          logger: this.createBeastcssLogger(),
        },
      );

      this.beastcssLogs = [];
    }
  }

  async initRoutes(...args) {
    const warnings = [];

    let userRoutes = ['/'];
    let appRoutes = ['/'];

    try {
      userRoutes = await promisifyRoutes(this.options.routes, ...args);
    } catch (err) {
      err.message = ` Could not resolve provided routes:\n\n ${err.message}`;

      warnings.push(err);
    }

    try {
      appRoutes = flatRoutes(await require('./get-app-routes')(
        {
          serverManifest: require(path.join(this.options.buildDir, './quasar.server-manifest.json')),
          basedir: appDir,
        },
      ));
    } catch (err) {
      err.message = ` Could not get static routes from router:\n\n ${err.message}`;

      warnings.push(err);
    }

    // remove duplicate routes between userRoutes and appRoutes
    // wether trailing slash is present or not
    userRoutes = userRoutes.filter(
      (route) => !appRoutes.includes(withTrailingSlash(route))
        && !appRoutes.includes(withoutTrailingSlash(route)),
    );

    const routes = [...new Set([...userRoutes, ...appRoutes])]
      .filter((route) => !this.isRouteExcluded(route));

    return {
      routes,
      warnings,
    };
  }

  async generate() {
    log('Initializing routes...');

    const { routes, warnings } = await this.initRoutes();

    warnings.forEach((warning, idx) => {
      let msg = idx === 0 ? 'Warning when initializing routes\n' : '';

      msg += `${warning.stack || warning}`;

      warn(msg);
    });

    log('Generating routes...');

    const { errors } = await this.generateRoutes(routes);

    if (this.options.inlineCriticalCss) {
      this.beastcss.clear();
    }

    errors.forEach(({ route, error }) => {
      let msg = `Error when generating route ${cyanBright(route)}\n`;

      msg += `${error.stack || error}`;

      error(msg);
    });

    return { errors, warnings };
  }

  async generateRoutes(routes) {
    const errors = [];

    this.queue = fastq.promise(
      this,
      async (route) => {
        try {
          await this.generateRoute(route);

          log(`Generated route ${cyanBright(route)}`);

          if (this.options.inlineCriticalCss) {
            logBeastcss(this.beastcssLogs[route], 'warn');
            logBeastcss(this.beastcssLogs[route], 'info');
          }
        } catch (e) {
          errors.push({ route, error: e });

          if (this.options.failOnError) {
            this.queue.killAndDrain();
          }
        }
      },
      this.options.concurrency,
    );

    // https://ajahne.github.io/blog/javascript/2018/05/10/javascript-timers-minimum-delay.html
    if (this.options.interval > 0) {
      this.queue.saturated = async () => {
        this.queue.pause();

        await new Promise((resolve) => { setTimeout(resolve, this.options.interval); });

        this.queue.resume();

        if (this.queue.length() > 0) {
          await this.queue.saturated();
        }
      };
    }

    // push routes to queue
    routes.forEach((route) => {
      route = decodeURI(route);

      // Add routes to the tracked generated routes (for crawler)
      this.generatedRoutes.add(route);

      this.queue.push(route);
    });

    // waiting for queue to be fully processed
    await this.queue.drained();

    return { errors };
  }

  async generateRoute(route) {
    let html = await this.render(route);

    if (!html) {
      return;
    }

    if (this.options.crawler) {
      this.crawl(html);
    }

    if (this.options.inlineCriticalCss) {
      html = await this.inlineCriticalCss(html, route);
    }

    if (typeof this.options.onRouteRendered === 'function') {
      html = await this.options.onRouteRendered(
        html,
        route,
        this.options.__distDir,
      );
    }

    if (this.options.minify !== false) {
      html = minify(html, this.options.minify);
    }

    const dest = path.join(this.options.__distDir, route, 'index.html');

    await fs.mkdir(path.dirname(dest), { recursive: true });

    await fs.writeFile(dest, html, 'utf8');
  }

  render(route) {
    return new Promise((resolve, reject) => {
      const opts = {
        req: { headers: {}, url: route },
        res: {},
      };

      this.renderer.renderToString(opts, (error, html) => {
        if (error) {
          if (error.url) {
            const redirectedRoute = decodeURI(error.url);

            try {
              // resolve to rendered redirected route
              return resolve(this.render(redirectedRoute));
            } catch (e) {
              return reject(e);
            }
          }

          if (error.code === 404) {
            // do not render 404 error
            return resolve();
          }

          return reject(error);
        }

        return resolve(html);
      });
    });
  }

  isRouteExcluded(route) {
    return this.options.exclude.some((regex) => {
      if (typeof regex === 'string') {
        return regex === route;
      }
      return regex.test(route);
    });
  }

  shouldGenerateRoute(route) {
    if (!isRouteValid(route)) {
      return false;
    }

    if (this.isRouteExcluded(route)) {
      return false;
    }

    return !this.generatedRoutes.has(route);
  }

  crawl(html) {
    parse(html)
      .querySelectorAll('a')
      .map((el) => {
        const sanitizedHref = (el.getAttribute('href') || '')
          .replace(this.options.vueRouterBase, '/')
          .split('?')[0]
          .split('#')[0]
          .replace(/\/+$/, '')
          .trim();

        const foundRoute = decodeURI(sanitizedHref);

        if (this.shouldGenerateRoute(foundRoute)) {
          this.generatedRoutes.add(foundRoute);
          this.queue.push(foundRoute);
        }

        return null;
      });
  }

  async inlineCriticalCss(html, route) {
    this.beastcssLogs[route] = [];

    try {
      html = await this.beastcss.process(html, route);
    } catch (e) {
      e.message = `Could not inline critical css\n\n${e.message}`;

      throw e;
    }

    return html;
  }

  createBeastcssLogger() {
    const logger = {};

    const getColor = (level) => {
      if (level === 'info') {
        return require('chalk').blue;
      }

      if (level === 'warn') {
        return require('chalk').yellow;
      }

      return require('chalk').red;
    };

    ['info', 'warn', 'error', 'trace', 'debug'].forEach((level) => {
      logger[level] = (msg, route) => this.beastcssLogs[route].push({
        level,
        msg,
        color: getColor(level),
      });
    });

    return logger;
  }
}

module.exports = Generator;
