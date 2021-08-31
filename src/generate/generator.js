/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs').promises;
const { minify } = require('html-minifier');
const path = require('path');
const esmRequire = require('jiti')(__filename);
const { parse } = require('node-html-parser');
const fastq = require('fastq');
const { cyanBright } = require('chalk');
const appRequire = require('../helpers/app-require');
const { log } = require('../helpers/logger');
const promisifyRoutes = require('../helpers/promisify-routes');
const isRouteValid = require('../helpers/is-route-valid');
const flatRoutes = require('../helpers/flat-routes');
const {
  withTrailingSlash,
  withoutTrailingSlash,
} = require('../helpers/normalize-slash');

class Generator {
  constructor(api, quasarConf, ctx) {
    const createRenderer = appRequire('@quasar/ssr-helpers/create-renderer', api.appDir);
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
      // keep comments to avoid issue at client-side hydration
      minify: quasarConf.build.minify
        ? { ...quasarConf.__html.minifyOptions, removeComments: false }
        : false,
      build: {
        publicPath: quasarConf.build.publicPath,
      },
      vueRouterBase: quasarConf.build.vueRouterBase,
      sourceFiles: quasarConf.sourceFiles,
      debug: ctx.debug,
    };

    this.generatedRoutes = new Set();

    if (this.options.inlineCriticalAsyncCss !== false) {
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
          external: false,
          internal: false,
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
    } catch (err) {
      err.message = `Could not resolve provided routes\n\n${this.options.debug ? err.message : ` ${err.message}`}`;
      throw err;
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

  async generateRoutes(routes) {
    const errors = [];

    this.queue = fastq.promise(
      this,
      async (route) => {
        try {
          await this.generateRoute(route);

          log(`Generated page for route "${cyanBright(route)}"`);
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
    let html = await this.renderRoute(route);

    if (!html) {
      return;
    }

    if (this.options.crawler) {
      this.crawl(html);
    }

    if (this.options.inlineCriticalAsyncCss !== false) {
      html = await this.inlineCriticalAsyncCss(html, route);
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

  async inlineCriticalAsyncCss(html, route) {
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
