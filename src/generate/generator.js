/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Beastcss = require('beastcss');
const fs = require('fs').promises;
const { minify } = require('html-minifier');
const path = require('path');
const esmRequire = require('jiti')(__filename);
const { parse } = require('node-html-parser');
const fastq = require('fastq');
const { cyanBright, redBright } = require('chalk');
const {
  log,
  warn,
  fatal,
  beastcssFormatMessage,
  logBeastcss,
} = require('../helpers/logger');
const promisifyRoutes = require('../helpers/promisify-routes');
const isRouteValid = require('../helpers/is-route-valid');
const flatRoutes = require('../helpers/flat-routes');
const {
  withTrailingSlash,
  withoutTrailingSlash,
} = require('../helpers/normalize-slash');

class Generator {
  constructor(api, quasarConf, ctx) {
    const ssr = require(`${quasarConf.build.distDir}/ssr-config`);

    ssr.mergeRendererOptions(quasarConf.ssg.rendererOptions);

    this.ssr = ssr;

    this.api = api;

    this.options = {
      ...quasarConf.ssg,
      minify: quasarConf.build.minify
        ? {
          ...quasarConf.__html.minifyOptions,
          removeComments: false,
          collapseWhitespace: false,
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

      this.beastcssMessages = [];

      this.beastcss = new Beastcss(
        {
          path: this.options.__distDir,
          publicPath: this.options.build.publicPath,
          additionalStylesheets: manifest.async,
          noscriptFallback: false,
          logger: this.createBeastcssLogger(),
          logLevel: ctx.debug ? 'debug' : 'info',
        },
      );
    }
  }

  async initRoutes(...args) {
    let userRoutes = [];

    try {
      userRoutes = await promisifyRoutes(this.options.routes, ...args);
    } catch (error) {
      warn(error.stack || error);

      fatal('Could not resolve routes');
    }

    let appRoutes = [];

    try {
      appRoutes = flatRoutes(await this.getAppRoutes());
    } catch (err) {
      appRoutes = ['/'];
    }

    appRoutes = appRoutes.filter((route) => !this.isRouteExcluded(route));

    // remove duplicate routes between userRoutes and appRoutes
    // wether trailing slash is present or not
    userRoutes = userRoutes.filter(
      (route) => !appRoutes.includes(withTrailingSlash(route))
        && !appRoutes.includes(withoutTrailingSlash(route)),
    );

    return [...new Set([...userRoutes, ...appRoutes])];
  }

  async getAppRoutes() {
    const routerPath = this.api.resolve.app(this.options.sourceFiles.router);
    const { default: createRouter } = esmRequire(routerPath);

    const router = typeof createRouter === 'function' ? await createRouter() : createRouter;

    return router.matcher.getRoutes();
  }

  async generate() {
    const routes = await this.initRoutes();

    const { errors } = await this.generateRoutes(routes);

    if (this.options.inlineCriticalCss) {
      this.beastcss.clear();
    }

    errors.forEach(({ route, error }) => {
      let msg = `Error when generating route ${cyanBright(route)}\n`;

      if (this.beastcssMessages[route].errors.length > 0) {
        msg += redBright(
          beastcssFormatMessage(`${this.beastcssMessages[route].errors[0]} \n`),
        );
      }

      if (this.options.debug) {
        msg += `${error.stack || error}`;
      }

      warn(msg);
    });

    return { errors };
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
            logBeastcss(this.beastcssMessages[route]);
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

        await new Promise((resolve) => setTimeout(resolve, this.options.interval));

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
    await new Promise((resolve) => {
      this.queue.drain = () => resolve();
    });

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

      this.ssr.renderToString(opts, (error, html) => {
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
    return this.beastcss.process(html, route);
  }

  createBeastcssLogger() {
    const saveMessage = (level) => (msg, id) => {
      if (id && !this.beastcssMessages[id]) {
        this.beastcssMessages[id] = {
          traces: [],
          debugs: [],
          infos: [],
          warns: [],
          errors: [],
        };
      }

      this.beastcssMessages[id][level].push(msg);
    };

    return {
      trace: saveMessage('traces'),
      debug: saveMessage('debugs'),
      info: saveMessage('infos'),
      warn: saveMessage('warns'),
      error: saveMessage('errors'),
    };
  }
}

module.exports = Generator;
