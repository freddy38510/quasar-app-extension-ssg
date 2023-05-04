/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */

const { readFileSync } = require('fs');
const path = require('path');
const { requireFromApp } = require('../api');
const {
  log,
  warn,
  info,
  dot,
  progress,
} = require('./helpers/logger');
const collectCss = require('./helpers/collect-css-ssr');
const config = require('./ssg-config');
const AppDevserver = require('./app-devserver');
const PagesGenerator = require('./PagesGenerator');
const printDevBanner = require('./helpers/print-dev-banner');
const getErrorRenderer = require('./helpers/get-dev-error-renderer');
const ssgCreateRenderFn = require('./ssg-create-render-fn');

const appPaths = requireFromApp('@quasar/app-vite/lib/app-paths');
const express = requireFromApp('express');
const { createServer } = requireFromApp('vite');
const chokidar = requireFromApp('chokidar');
const debounce = requireFromApp('lodash/debounce');

const openBrowser = requireFromApp('@quasar/app-vite/lib/helpers/open-browser');
const {
  entryPointMarkup, getDevSsrTemplateFn, attachMarkup, transformHtml,
} = requireFromApp('@quasar/app-vite/lib/helpers/html-template');

const templatePath = appPaths.resolve.app('index.html');
const serverEntryFile = appPaths.resolve.app('.quasar/server-entry.js');

const { injectPwaManifest } = requireFromApp(
  '@quasar/app-vite/lib/modes/pwa/utils',
);

const doubleSlashRE = /\/\//g;
function logServerMessage(title, msg, additional) {
  log();
  info(`${msg}${additional !== void 0 ? ` ${dot} ${additional}` : ''}`, title);
}

class SsgDevServer extends AppDevserver {
  #closeDevserver;

  #viteClient;

  #viteServer;

  #htmlWatcher;

  #renderTemplate;

  #renderError;

  #fallbackHtml;

  /**
   * @type {{
   *  port: number;
   *  publicPath: string;
   *  resolveUrlPath: import('../../../types').SsrMiddlewareResolve['urlPath'];
   *  render: (ssrContext: import('../../../types').QSsrContext) => Promise<string>;
   * }}
   */
  #appOptions = {};

  #pagesGenerator;

  #pwaManifestWatcher;

  #pwaServiceWorkerWatcher;

  constructor(opts) {
    super(opts);

    this.registerDiff('ssg', (quasarConf) => [
      quasarConf.ssg.routes,
      quasarConf.ssg.crawler,
      quasarConf.ssg.exclude,
    ]);

    this.registerDiff('pwaSsr', (quasarConf) => [
      quasarConf.ssr.pwa,
      quasarConf.ssr.pwa === true ? quasarConf.pwa.swFilename : '',
    ]);

    this.registerDiff('pwaManifest', (quasarConf) => [
      quasarConf.pwa.injectPwaMetaTags,
      quasarConf.pwa.manifestFilename,
      quasarConf.pwa.extendManifestJson,
      quasarConf.pwa.useCredentialsForManifestTag,
    ]);

    this.registerDiff('pwaServiceWorker', (quasarConf) => [
      quasarConf.pwa.workboxMode,
      quasarConf.pwa.precacheFromPublicFolder,
      quasarConf.pwa.swFilename,
      quasarConf.pwa[quasarConf.pwa.workboxMode === 'generateSW'
        ? 'extendGenerateSWOptions'
        : 'extendInjectManifestOptions'
      ],
      quasarConf.pwa.workboxMode === 'injectManifest'
        ? [quasarConf.build.env, quasarConf.build.rawDefine]
        : '',
    ]);
  }

  run(quasarConf, __isRetry) {
    const { diff, queue } = super.run(quasarConf, __isRetry);

    if (quasarConf.ssr.pwa === true) {
      if (diff('pwaManifest', quasarConf) === true) {
        return queue(() => this.#compilePwaManifest(quasarConf));
      }

      if (diff('pwaServiceWorker', quasarConf) === true) {
        return queue(() => this.#compilePwaServiceWorker(quasarConf, queue));
      }
    }

    if (diff(['vite', 'ssg', 'pwaSsr'], quasarConf) === true) {
      return queue(() => this.#runVite(quasarConf, diff('viteUrl', quasarConf)));
    }

    return undefined;
  }

  async #runVite(quasarConf, urlDiffers) {
    if (this.#closeDevserver !== void 0) {
      this.#htmlWatcher.close();
      this.#viteClient.close();
      this.#viteServer.close();
      this.#closeDevserver();
    }

    const { publicPath } = quasarConf.build;

    this.#appOptions.port = quasarConf.devServer.port;
    this.#appOptions.publicPath = publicPath;

    this.#appOptions.resolveUrlPath = publicPath === '/'
      ? (url) => url || '/'
      : (url) => (url ? (publicPath + url).replace(doubleSlashRE, '/') : publicPath);

    this.#viteClient = await createServer(await config.viteClient(quasarConf));
    this.#viteServer = await createServer(await config.viteServer(quasarConf));

    this.#renderError = getErrorRenderer(this.#viteClient);

    if (quasarConf.ssr.pwa === true) {
      injectPwaManifest(quasarConf, true);
    }

    const updateTemplate = () => {
      const template = readFileSync(templatePath, 'utf-8');
      this.#renderTemplate = getDevSsrTemplateFn(template, quasarConf);

      this.#fallbackHtml = transformHtml(template, quasarConf).replace(
        entryPointMarkup,
        attachMarkup,
      );
    };

    updateTemplate();

    this.#htmlWatcher = chokidar
      .watch(templatePath)
      .on('change', updateTemplate);

    await this.#warmupServer();

    await this.#warmupGenerator(quasarConf);

    await this.#bootDevserver(quasarConf);

    if (urlDiffers === true && quasarConf.metaConf.openBrowser) {
      const { metaConf } = quasarConf;
      openBrowser({
        url: metaConf.APP_URL,
        opts: metaConf.openBrowser !== true ? metaConf.openBrowser : false,
      });
    }
  }

  async #warmupServer() {
    const done = progress('Warming up...');

    try {
      await this.#viteServer.ssrLoadModule(serverEntryFile);
      await this.#viteClient.transformRequest('.quasar/client-entry.js');
    } catch (err) {
      warn('Warmup failed!', 'FAIL');
      console.error(err);
      return;
    }

    done('Warmed up');
  }

  async #warmupGenerator(quasarConf) {
    const renderFn = ssgCreateRenderFn(quasarConf, this.#viteServer);

    this.#pagesGenerator = new PagesGenerator(
      quasarConf,
      async (ssrContext) => {
        try {
          const runtimePageContent = await renderFn(ssrContext);

          let html = this.#renderTemplate(ssrContext);

          html = await this.#viteClient.transformIndexHtml(
            ssrContext.req.url,
            html,
            ssrContext.req.url,
          );

          html = html
            .replace(
              '</head>',
              `${collectCss(
                this.#viteServer.moduleGraph.getModuleById(serverEntryFile),
                [...ssrContext.modules]
                  .map((componentPath) => this.#viteServer.moduleGraph.getModuleById(
                    path.resolve(componentPath),
                  )),
              )}</head>`,
            )
            .replace(
              entryPointMarkup,
              `<div id="q-app">${runtimePageContent}</div>`,
            );

          return html;
        } catch (err) {
          this.#viteServer.ssrFixStacktrace(err);
          throw err;
        }
      },
    );

    if (quasarConf.ssg.includeStaticRoutes !== false) {
      const { getRoutesFromRouter } = await this.#viteServer.ssrLoadModule(
        serverEntryFile,
      );

      this.#pagesGenerator.getRoutesFromRouter = getRoutesFromRouter;
    }

    await this.#pagesGenerator.initRoutes();
  }

  async #bootDevserver(quasarConf) {
    const app = express();

    // attackers can use this header to detect apps running Express
    // and then launch specifically-targeted attacks
    app.disable('x-powered-by');

    // vite devmiddleware modifies req.url to account for publicPath
    // but we'll break usage in the dev server if we do so
    app.use((req, res, next) => {
      const { url } = req;
      this.#viteClient.middlewares.handle(req, res, (err) => {
        req.url = url;
        next(err);
      });
    });

    app.get(this.#appOptions.resolveUrlPath('*'), async (req, res) => {
      let html = null;
      let isFallback = false;

      const startTime = Date.now();
      const route = this.#pagesGenerator.normalizeRoute(req.url);

      res.setHeader('Content-Type', 'text/html');

      try {
        if (this.#pagesGenerator.queue.has(route)) {
          // html is null if encounters 404 or redirect
          ({ html } = await this.#pagesGenerator.generatePage(route));
        }

        if (html === null) {
          isFallback = true;

          html = await this.#viteClient.transformIndexHtml(
            req.url,
            this.#fallbackHtml,
            req.url,
          );
        }

        logServerMessage(
          `Rendered (${isFallback ? 'SPA Fallback' : 'SSG'})`,
          req.url,
          `${Date.now() - startTime}ms`,
        );

        res.send(html);
      } catch (err) {
        this.#renderError({ err, req, res });
      }
    });

    const { publicPath } = this.#appOptions;

    if (publicPath !== '/') {
      app.use((req, res, next) => {
        const pathname = new URL(req.url, `http://${req.headers.host}`).pathname || '/';

        if (pathname.startsWith(publicPath) === true) {
          next();
          return;
        }

        if (req.url === '/' || req.url === '/index.html') {
          res.writeHead(302, { Location: publicPath });
          res.end();
          return;
        }
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
          const parsedPath = pathname.slice(1);
          const redirectPaths = [publicPath + parsedPath];
          const splitted = parsedPath.split('/');

          if (splitted.length > 1) {
            redirectPaths.push(publicPath + splitted.slice(1).join('/'));
          }

          if (redirectPaths[redirectPaths.length - 1] !== publicPath) {
            redirectPaths.push(publicPath);
          }

          const linkList = redirectPaths
            .map((link) => `<a href="${link}">${link}</a>`)
            .join(' or ');

          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(
            `<div>The Quasar CLI devserver is configured with a publicPath of "${publicPath}"</div>`
            + `<div> - Did you mean to visit ${linkList} instead?</div>`,
          );
          return;
        }

        next();
      });
    }

    const listenResult = app.listen(this.#appOptions.port, quasarConf.devServer.host);

    this.#closeDevserver = () => listenResult.close();

    printDevBanner(quasarConf);
  }

  #compilePwaManifest(quasarConf) {
    if (this.#pwaManifestWatcher !== void 0) {
      this.#pwaManifestWatcher.close();
    }

    function inject() {
      injectPwaManifest(quasarConf);
      log(
        `Generated the PWA manifest file (${quasarConf.pwa.manifestFilename})`,
      );
    }

    this.#pwaManifestWatcher = chokidar
      .watch(quasarConf.metaConf.pwaManifestFile, { ignoreInitial: true })
      .on(
        'change',
        debounce(() => {
          inject();

          if (this.#viteClient !== void 0) {
            this.#viteClient.ws.send({
              type: 'full-reload',
              path: '*',
            });
          }
        }, 550),
      );

    inject();
  }

  // also update pwa-devserver.js when changing here
  async #compilePwaServiceWorker(quasarConf, queue) {
    // eslint-disable-next-line global-require
    const { buildPwaServiceWorker } = require('./helpers/pwa-utils');

    if (this.#pwaServiceWorkerWatcher) {
      await this.#pwaServiceWorkerWatcher.close();
    }

    const workboxConfig = await config.workbox(quasarConf);

    if (quasarConf.pwa.workboxMode === 'injectManifest') {
      const esbuildConfig = await config.customSw(quasarConf);

      await this.buildWithEsbuild(
        'Custom Service Worker',
        esbuildConfig,
        () => {
          queue(() => buildPwaServiceWorker(quasarConf.pwa.workboxMode, workboxConfig));
        },
      ).then((result) => {
        this.#pwaServiceWorkerWatcher = { close: result.stop };
      });
    }

    await buildPwaServiceWorker(quasarConf.pwa.workboxMode, workboxConfig);
  }
}

module.exports = SsgDevServer;
