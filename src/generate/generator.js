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
const appRequire = require('../helpers/app-require');
const { log, logBeastcss } = require('../helpers/logger');
const promisifyRoutes = require('../helpers/promisify-routes');
const isRouteValid = require('../helpers/is-route-valid');
const flatRoutes = require('../helpers/flat-routes');
const {
  withTrailingSlash,
  withoutTrailingSlash,
} = require('../helpers/normalize-slash');

class Generator {
  constructor(api, quasarConf, ctx) {
    const createRenderer = appRequire(
      '@quasar/ssr-helpers/create-renderer',
      api.appDir,
    );
    const { renderToString } = appRequire('@vue/server-renderer', api.appDir);
    const serverManifest = require(`${quasarConf.build.distDir}/quasar.server-manifest.json`);
    const clientManifest = require(`${quasarConf.build.distDir}/quasar.client-manifest.json`);
    const renderTemplate = require(`${quasarConf.build.distDir}/render-template.js`);
    const ssrRenderer = createRenderer({
      vueRenderToString: renderToString,
      basedir: quasarConf.build.distDir,
      serverManifest,
      clientManifest,
    });

    this.api = api;

    this.ssrRender = async (ssrContext) => ssrRenderer(ssrContext, renderTemplate);

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
      debug: ctx.debug,
    };

    this.generatedRoutes = new Set();

    if (quasarConf.ssg.inlineCriticalCss) {
      this.beastcss = new Beastcss({
        path: quasarConf.ssg.__distDir,
        publicPath: quasarConf.build.publicPath,
        noscriptFallback: false,
        logger: this.createBeastcssLogger(),
      });

      this.beastcssLogs = [];
    }
  }

  async initRoutes() {
    const warnings = [];
    let appRoutes = [];
    let userRoutes = [];

    try {
      userRoutes = await promisifyRoutes(this.options.routes);
    } catch (err) {
      err.message = ` Could not resolve provided routes:\n\n ${err.message}`;

      warnings.push(err);
    }

    try {
      appRoutes = flatRoutes(await this.getAppRoutes());
    } catch (err) {
      err.message = ` Could not resolve routes from Vue Router:\n\n ${err.message}`;

      warnings.push(err);

      appRoutes = ['/'];
    }

    appRoutes = appRoutes.filter((route) => !this.isRouteExcluded(route));

    // remove duplicate routes between userRoutes and appRoutes
    // wether trailing slash is present or not
    userRoutes = userRoutes.filter(
      (route) => !appRoutes.includes(withTrailingSlash(route))
        && !appRoutes.includes(withoutTrailingSlash(route)),
    );

    return {
      routes: [...new Set([...userRoutes, ...appRoutes])],
      warnings,
    };
  }

  async getAppRoutes() {
    const { default: createRouter } = require(path.join(this.options.buildDir, 'compiled-router.js'));

    const router = typeof createRouter === 'function' ? await createRouter() : createRouter;

    return router.getRoutes();
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
            logBeastcss(this.beastcssLogs[route], 'warn');
            logBeastcss(this.beastcssLogs[route], 'info');
          }
        } catch (e) {
          errors.push({ route, error: e });

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

    try {
      html = await this.renderRoute(route);
    } catch (e) {
      e.message = `Could not pre-render route\n\n${e.message}`;

      throw e;
    }

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
          this.options.__distDir,
        );
      } catch (e) {
        e.message = `Could not process onRouteRendered hook\n\n${e.message}`;

        throw e;
      }
    }

    if (this.options.minify !== false) {
      try {
        html = minify(html, this.options.minify);
      } catch (e) {
        e.message = `Could not minify html\n\n${e.message}`;

        throw e;
      }
    }

    const dest = path.join(this.options.__distDir, route, 'index.html');

    await fs.mkdir(path.dirname(dest), { recursive: true });

    await fs.writeFile(dest, html, 'utf8');
  }

  async renderRoute(route) {
    const ssrContext = {
      req: { headers: {}, url: route },
      res: {},
    };

    try {
      return this.ssrRender(ssrContext);
    } catch (error) {
      if (error.url) {
        const redirectedRoute = decodeURI(error.url);

        return this.renderRoute(redirectedRoute);
      }

      if (error.code === 404) {
        return null;
      }

      throw error;
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
    return {
      info: (msg, route) => this.beastcssLogs[route].push({ level: 'info', msg }),
      warn: (msg, route) => this.beastcssLogs[route].push({ level: 'warn', msg }),
      error: (msg, route) => this.beastcssLogs[route].push({ level: 'error', msg }),
      trace: (msg, route) => this.beastcssLogs[route].push({ level: 'trace', msg }),
      debug: (msg, route) => this.beastcssLogs[route].push({ level: 'debug', msg }),
    };
  }
}

module.exports = Generator;
