/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Critters = require('critters');
const fs = require('fs').promises;
const { minify } = require('html-minifier');
const path = require('path');
const fastq = require('fastq');
const { cyanBright, redBright } = require('chalk');
const {
  log, warn, fatal, routeBanner,
} = require('../helpers/logger');
const promisifyRoutes = require('../helpers/promisify-routes');

class Generator {
  constructor(api, quasarConf, ctx) {
    const ssr = require(`${quasarConf.build.distDir}/ssr-config`);

    ssr.mergeRendererOptions(quasarConf.ssg.rendererOptions);

    this.ssr = ssr;

    this.api = api;

    this.options = {
      ...quasarConf.ssg,
      minify: quasarConf.build.minify
        ? { ...quasarConf.__html.minifyOptions, removeComments: false }
        : false,
      build: {
        publicPath: quasarConf.build.publicPath,
      },
      failOnError: ctx.failOnError,
      debug: ctx.debug,
    };
  }

  async initRoutes(...args) {
    let routes = {};
    try {
      routes = await promisifyRoutes(
        this.options.routes,
        ...args,
      );
    } catch (error) {
      warn(error.stack || error);

      fatal('Could not resolve routes');
    }

    return routes;
  }

  async generate() {
    const routes = await this.initRoutes();
    const errors = [];

    const { errors } = await this.generateRoutes(routes);

    errors.forEach(({ route, error }) => {
      warn(
        `Error when generating route ${cyanBright(route)} \n ${error.stack || error
        }`,
      );
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

    if (this.options.criticalCss !== false) {
      html = await this.inlineCriticalCss(html);
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
          reject(error);
        }
        resolve(html);
      });
    });
  }

  async inlineCriticalCss(html, task = null) {
    const loggerFn = (level) => {
      if (task === null) {
        return (msg) => { level(msg); };
      }

      return (msg) => { task.output = msg; };
    };

    const critters = new Critters({
      path: this.options.__distDir,
      publicPath: this.options.build.publicPath,
      logger: {
        log: loggerFn(log),
        info: loggerFn(log),
        warn: loggerFn(warn),
        error: loggerFn(warn),
      },
    });

    return critters.process(html);
  }
}

module.exports = Generator;
