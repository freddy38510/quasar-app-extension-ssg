const { join, dirname, relative } = require('path');
const { ErrorWithCause, stackWithCauses } = require('pony-cause');
const { underline, green } = require('kolorist');
const {
  info,
  warn,
  fatal,
  progress,
  beastcssLog,
} = require('./helpers/logger');
const {
  promisifyRoutes,
  isRouteValid,
  flatRoutes,
} = require('./helpers/routes');
const {
  withTrailingSlash,
  withoutTrailingSlash,
} = require('./helpers/normalize-slash');

class PagesGenerator {
  #opts;

  #render;

  #enqueuedPages = new Set();

  #parseHtml;

  #beastcss;

  #beastcssLogs = [];

  constructor(quasarConf, render) {
    this.#render = render;

    this.#opts = {
      ...quasarConf.ssg,
      vueRouterBase: quasarConf.build.vueRouterBase,
      publicPath: quasarConf.build.publicPath,
      isProd: quasarConf.ctx.prod,
    };

    this.#initQueue();

    if (quasarConf.ssg.crawler) {
      this.#parseHtml = require('node-html-parser').parse;
    }

    if (quasarConf.ssg.inlineCriticalCss) {
      this.#initBeastcss();
    }
  }

  #initQueue() {
    if (!this.#opts.isProd) {
      this.queue = new Set();

      this.queue.enqueue = (route) => {
        this.#enqueuedPages.add(route);
        return this.queue.add(route);
      };

      return;
    }

    const { mkdir, writeFile } = require('fs/promises');
    const fastq = require('fastq');

    this.queue = fastq.promise(
      this,
      async (route) => {
        try {
          const { html, filepath } = await this.generatePage(route);

          if (!html) {
            return;
          }

          await mkdir(dirname(filepath), { recursive: true });

          await writeFile(filepath, html, 'utf8');

          info(
            `Generated page: "${underline(
              green(relative(this.#opts.distDir, filepath)),
            )}"`,
          );

          if (this.#opts.inlineCriticalCss) {
            beastcssLog(this.#beastcssLogs[route], 'warn');
            beastcssLog(this.#beastcssLogs[route], 'info');
          }
        } catch (e) {
          fatal(stackWithCauses(e));
        }
      },
      this.#opts.concurrency,
    );

    if (this.#opts.interval > 0) {
      this.queue.saturated = async () => {
        this.queue.pause();

        await new Promise((resolve) => {
          setTimeout(resolve, this.#opts.interval);
        });

        this.queue.resume();

        if (this.queue.length() > 0) {
          await this.queue.saturated();
        }
      };
    }

    this.queue.pause();

    this.queue.enqueue = (route) => {
      this.#enqueuedPages.add(route);
      return this.queue.push(route);
    };
  }

  #initBeastcss() {
    const Beastcss = require('beastcss');

    const logger = {};

    ['info', 'warn'].forEach((level) => {
      logger[level] = (msg, route) => this.#beastcssLogs[route].push({
        level,
        msg,
      });
    });

    this.#beastcss = new Beastcss({
      noscriptFallback: false,
      ...(this.#opts.inlineCriticalCss || {}),
      path: this.#opts.distDir,
      publicPath: this.#opts.publicPath,
      logger,
    });
  }

  async generate() {
    try {
      await this.initRoutes();

      this.queue.resume();

      const done = progress('Generating ___ in progress...', 'Pages');

      // waiting for queue to be fully processed
      await this.queue.drained();

      if (this.#opts.inlineCriticalCss) {
        this.#beastcss.clear();
      }

      done('___ generated with success');
    } catch (err) {
      fatal(stackWithCauses(err));
    }
  }

  async initRoutes() {
    let userRoutes = ['/'];
    let staticRoutes = ['/'];

    const done = progress('Initializing ___ in progress...', 'route(s)');

    if (this.#opts.crawler) {
      info(
        'The crawler feature will find dynamic routes in the generated html',
      );
    }

    try {
      userRoutes = await promisifyRoutes(this.#opts.routes);
      userRoutes = userRoutes.map((route) => this.normalizeRoute(route));
    } catch (err) {
      warn(
        stackWithCauses(
          new ErrorWithCause('Failed to resolve provided routes', {
            cause: err,
          }),
        ),
      );
    }

    if (this.#opts.includeStaticRoutes !== false) {
      if (this.#opts.isProd) {
        this.getRoutesFromRouter = require(join(
          this.#opts.compilationDir,
          './server/server-entry',
        )).getRoutesFromRouter;
      }

      try {
        staticRoutes = flatRoutes(await this.getRoutesFromRouter());
      } catch (err) {
        warn(
          stackWithCauses(
            new ErrorWithCause('Failed to get static routes from router', {
              cause: err,
            }),
          ),
        );
      }
    }

    // remove duplicate routes between userRoutes and appRoutes
    // wether trailing slash is present or not
    userRoutes = userRoutes.filter(
      (route) => !staticRoutes.includes(withTrailingSlash(route))
        || !staticRoutes.includes(withoutTrailingSlash(route)),
    );

    const routes = [...new Set([...userRoutes, ...staticRoutes])].filter(
      (route) => !this.#isRouteExcluded(route),
    );

    routes.forEach((route) => this.queue.enqueue(route));

    done(`Initialized ${routes.length} ___ with success`);
  }

  async generatePage(route) {
    let html = await this.#renderPage(route);

    if (html === null) {
      return { html };
    }

    if (this.#opts.crawler) {
      this.#crawl(html);
    }

    if (this.#opts.inlineCriticalCss) {
      html = await this.#inlineCriticalCss(html, route);
    }

    let filepath = join(this.#opts.distDir, route, 'index.html');

    if (typeof this.#opts.onPageGenerated === 'function') {
      try {
        ({ html, path: filepath } = await this.#opts.onPageGenerated({
          route,
          html,
          path: filepath,
        }));
      } catch (e) {
        throw new ErrorWithCause(
          `Failed to execute "onPageGenerated" hook when generating page: "${underline(
            green(relative(this.#opts.distDir, filepath)),
          )}"`,
          { cause: e },
        );
      }
    }

    return { html, filepath };
  }

  normalizeRoute(route) {
    return route.replace(this.#opts.vueRouterBase, '/')
      .split('?')[0]
      .split('#')[0]
      .trim();
  }

  async #renderPage(route) {
    const ssrContext = {
      req: { headers: {}, url: route },
      res: {},
    };

    try {
      return await this.#render(ssrContext);
    } catch (e) {
      if (e.url) {
        const redirectedRoute = decodeURI(e.url);

        if (this.#shouldGeneratePage(redirectedRoute)) {
          this.queue.enqueue(redirectedRoute);

          if (!this.#opts.isProd) {
            info(
              `New route "${underline(
                green(redirectedRoute),
              )}" found redirected from the route: "${underline(green(route))}"`,
            );
          }
        }

        return null;
      }

      if (e.code === 404) {
        // Should reach here only if no "catch-all" route
        // is defined in /src/routes

        return null;
      }

      throw new ErrorWithCause(
        `Failed to pre-render page for route: "${underline(
          green(route),
        )}"`,
        { cause: e },
      );
    }
  }

  #isRouteExcluded(route) {
    return this.#opts.exclude.some((regex) => {
      if (typeof regex === 'string') {
        return regex === route;
      }

      return regex.test(route);
    });
  }

  #shouldGeneratePage(route) {
    if (!isRouteValid(route) || this.#isRouteExcluded(route)) {
      return false;
    }

    return this.#opts.isProd
      ? !this.#enqueuedPages.has(route)
      : !this.queue.has(route);
  }

  #crawl(html) {
    this.#parseHtml(html)
      .querySelectorAll('a')
      .forEach((el) => {
        const foundRoute = this.normalizeRoute(decodeURI(el.getAttribute('href') || ''));

        if (this.#shouldGeneratePage(foundRoute)) {
          this.queue.enqueue(foundRoute);

          if (!this.#opts.isProd) {
            info(`Crawler found new route: "${underline(green(foundRoute))}"`);
          }
        }
      });
  }

  async #inlineCriticalCss(html, route) {
    this.#beastcssLogs[route] = [];

    try {
      return await this.#beastcss.process(html, route);
    } catch (e) {
      throw new ErrorWithCause(
        `Failed to inline critical css when generating page for route: "${underline(
          green(route),
        )}"`,
        { cause: e },
      );
    }
  }
}

module.exports = PagesGenerator;
