/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const fs = require('fs').promises;
const { minify } = require('html-minifier');
const Beastcss = require('beastcss');
const { parse } = require('node-html-parser');
const fastq = require('fastq');
const { cyanBright } = require('chalk');
const { appDir } = require('../helpers/app-paths');
const { log, beastcssLog } = require('../helpers/logger');
const promisifyRoutes = require('../helpers/promisify-routes');
const isRouteValid = require('../helpers/is-route-valid');
const flatRoutes = require('../helpers/flat-routes');
const {
  withTrailingSlash,
  withoutTrailingSlash,
} = require('../helpers/normalize-slash');

class Generator {
  constructor(quasarConf) {
    this.render = require(path.join(quasarConf.ssg.buildDir, 'render.js'));

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
      debug: quasarConf.ctx.debug,
    };

    this.generatedRoutes = new Set();

    if (quasarConf.ssg.inlineCriticalCss) {
      this.beastcss = new Beastcss({
        noscriptFallback: false,
        ...quasarConf.ssg.inlineCriticalCss || {},
        path: quasarConf.ssg.distDir,
        publicPath: quasarConf.build.publicPath,
        logger: this.createBeastcssLogger(),
      });

      this.beastcssLogs = [];
    }
  }

  async initRoutes() {
    const warnings = [];

    let userRoutes = ['/'];
    let appRoutes = ['/'];

    try {
      userRoutes = await promisifyRoutes(this.options.routes);
    } catch (err) {
      err.hint = 'Could not resolve provided routes';

      warnings.push(err);
    }

    if (this.options.includeStaticRoutes !== false) {
      try {
        appRoutes = flatRoutes(await require('./get-app-routes')({
          basedir: appDir,
          serverManifest: require(path.join(this.options.buildDir, './quasar.server-manifest.json')),
        }));
      } catch (err) {
        err.hint = 'Could not get static routes from router';

        warnings.push(err);
      }
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

  async generateRoutes(routes) {
    const errors = [];

    this.queue = fastq.promise(
      this,
      async (route) => {
        try {
          await this.generateRoute(route);

          log(`Generated page for route "${cyanBright(route)}"`);

          if (this.options.inlineCriticalCss) {
            beastcssLog(this.beastcssLogs[route], 'warn');
            beastcssLog(this.beastcssLogs[route], 'info');
          }
        } catch (e) {
          errors.push(e);

          this.queue.killAndDrain();
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

    if (this.options.inlineCriticalCss) {
      this.beastcss.clear();
    }

    return { errors };
  }

  async generateRoute(route) {
    let html;

    html = await this.renderRoute(route);

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
      try {
        html = await this.options.onRouteRendered(
          html,
          route,
          this.options.distDir,
        );
      } catch (e) {
        e.hint = `Could not process "onRouteRendered" hook for route "${bold(route)}"`;

        throw e;
      }
    }

    if (this.options.minify !== false) {
      try {
        html = minify(html, this.options.minify);
      } catch (e) {
        e.hint = `Could not minify html string of pre-rendered route "${green(route)}"`;

        throw e;
      }
    }

    const dest = path.join(this.options.distDir, route, 'index.html');


    await fs.mkdir(path.dirname(dest), { recursive: true });

    await fs.writeFile(dest, html, 'utf8');
  }

  async renderRoute(route) {
    const ssrContext = {
      req: { headers: {}, url: route },
      res: {},
    };

    try {
      return await this.render(ssrContext);
    } catch (e) {
      if (e.url) {
        const redirectedRoute = decodeURI(e.url);

        if (this.shouldGenerateRoute(redirectedRoute)) {
          this.generatedRoutes.add(redirectedRoute);

          this.queue.push(redirectedRoute);
        }

        return null;
      }

      if (e.code === 404) {
        // hmm, Vue Router could not find the requested route

        // Should reach here only if no "catch-all" route
        // is defined in /src/routes

        return null;
      }

      e.hint = `Could not pre-render route ${bold(route)}`;

      throw e;
    }
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
      .forEach((el) => {
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
      });
  }

  async inlineCriticalCss(html, route) {
    this.beastcssLogs[route] = [];

    try {
      return await this.beastcss.process(html, route);
    } catch (e) {
      e.hint = `Could not inline critical css of pre-rendered route "${green(route)}"`;

      throw e;
    }
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
