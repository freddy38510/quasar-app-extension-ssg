/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-void */
/* eslint-disable no-underscore-dangle */
const { join } = require('path');
const { green, grey } = require('chalk');
const requireFromApp = require('../helpers/require-from-app');

const webpack = requireFromApp('webpack');
const WebpackDevServer = requireFromApp('webpack-dev-server');

const express = requireFromApp('express');
const { getClientManifest } = require('../build/webpack/ssr/plugin.client-side');
const { getServerManifest } = require('../build/webpack/ssr/plugin.server-side');
const { doneExternalWork } = require('../build/webpack/plugin.progress');
const { webpackNames } = require('../build/webpack/symbols');

const appPaths = require('../helpers/app-paths');

const openBrowser = requireFromApp('@quasar/app/lib/helpers/open-browser');
const ouchInstance = requireFromApp('@quasar/app/lib/helpers/cli-error-handling').getOuchInstance();

const HtmlWebpackPlugin = requireFromApp('html-webpack-plugin');

const banner = ' [Quasar Dev Webserver]';
const createRendererFile = appPaths.resolve.app('.quasar/ssg/create-renderer.js');
const renderTemplateFile = appPaths.resolve.app('.quasar/ssg/render-template.js');
const Generator = require('../generate/generator');
const ssgMiddleware = require('./ssg-middleware');
const renderPrettyError = require('../helpers/render-pretty-error');
const { log, warning, error } = require('../helpers/logger');

const renderError = ({ err, req, res }) => {
  ouchInstance.handleException(err, req, res, () => {
    console.error();
    error(err.hint || `${req.url} -> error during pre-render`);
    console.error();
    console.error(renderPrettyError(err));
  });
};

const doubleSlashRE = /\/\//g;

const pluginName = 'ssg-dev-plugin';

let openedBrowser = false;

module.exports = class DevServer {
  constructor(quasarConfFile) {
    this.quasarConfFile = quasarConfFile;
    this.setInitialState();
  }

  setInitialState() {
    this.handlers = [];

    this.webpackServer = null;
    this.isServerCompilerRunning = false;
    this.isClientCompilerRunning = false;
  }

  async listen() {
    const { webpackConf, quasarConf: cfg } = this.quasarConfFile;

    const clientCompiler = webpack(webpackConf.clientSide);
    const rendererCompiler = webpack(webpackConf.renderer);
    const serverCompiler = webpack(webpackConf.serverSide);

    let serverManifest;
    let clientManifest;
    let fallbackHtml;
    let webpackServerListening = false;

    this.generator = new Generator(cfg);

    let tryToFinalize = () => {
      if (serverManifest && clientManifest && webpackServerListening === true) {
        tryToFinalize = () => { };

        if (openedBrowser === false) {
          openedBrowser = true;

          if (cfg.__devServer.open) {
            openBrowser({ url: cfg.build.APP_URL, opts: cfg.__devServer.openOptions });
          }
        }
      }
    };

    const { publicPath } = cfg.build;
    const resolveUrlPath = publicPath === '/'
      ? (url) => url || '/'
      : (url) => (url ? (publicPath + url).replace(doubleSlashRE, '/') : publicPath);

    const publicFolder = appPaths.resolve.app('public');

    function resolvePublicFolder(...args) {
      return join(publicFolder, ...args);
    }

    const serveStatic = (path, opts = {}) => express.static(resolvePublicFolder(path), {
      ...opts,
      maxAge: opts.maxAge === void 0
        ? cfg.ssr.maxAge
        : opts.maxAge,
    });

    const update = async () => {
      tryToFinalize();

      // always get updated config
      const { quasarConf } = this.quasarConfFile;

      delete require.cache[createRendererFile];
      delete require.cache[renderTemplateFile];

      const createRenderer = require(createRendererFile);
      const renderTemplate = require(renderTemplateFile);

      const renderer = createRenderer(serverManifest, clientManifest);

      this.generator.init(
        quasarConf,
        async (ssrContext) => renderer(ssrContext, renderTemplate),
        clientCompiler.outputFileSystem.promises,
      );

      log('Initializing routes to generate...');

      const { routes, warnings } = await this.generator.initRoutes(serverManifest);

      warnings.forEach((err) => {
        warning(err.hint || 'Warning during initialize routes');
        console.warn();
        console.warn(renderPrettyError(err));
      });

      routes.forEach((route) => {
        this.generator.routesToGenerate.add(route);
        this.generator.queue.add(route);
      });

      if (
        this.webpackServer.webSocketServer
        && cfg.devServer.liveReload !== false
        && openedBrowser
      ) {
        this.webpackServer.sendMessage(
          this.webpackServer.webSocketServer.clients,
          'reload',
        );
      }
    };

    const generateRoute = async (route) => {
      if (this.generator.queue.has(route)) {
        const startTime = Date.now();

        log(`Generating route... ${green(route)}`);

        // throw error if render failed
        // route added to skippedRoutes if 404 or redirect
        await this.generator.generateRoute(route);

        // only delete from queue if rendering route not failed
        // this way the error could be thrown again if page is refreshed
        this.generator.queue.delete(route);

        if (!this.generator.skippedRoutes.has(route)) {
          log(`Generated route ${green(route)} ${grey(`${Date.now() - startTime}ms`)}`);
        }
      }

      return !this.generator.skippedRoutes.has(route) && this.generator.routesToGenerate.has(route);
    };

    clientCompiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.afterProcessAssets.tap(
        pluginName,
        () => {
          if (!compilation.getStats().hasErrors()) {
            clientManifest = getClientManifest(compilation);
          }
        },
      );

      HtmlWebpackPlugin.getHooks(compilation).afterEmit.tapPromise(pluginName, async (data) => {
        if (!compilation.getStats().hasErrors()) {
          fallbackHtml = compilation.getAsset(data.outputName).source.source();
        }

        return data;
      });
    });

    clientCompiler.hooks.watchRun.tapPromise(pluginName, async () => {
      this.isClientCompilerRunning = true;
    });

    clientCompiler.hooks.done.tapPromise(pluginName, async (stats) => {
      if (this.isServerCompilerRunning === false && !stats.hasErrors()) {
        await update();
      }

      this.isClientCompilerRunning = false;
    });

    serverCompiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.afterProcessAssets.tap(pluginName, () => {
        if (!compilation.getStats().hasErrors()) {
          serverManifest = getServerManifest(compilation);
        }
      });
    });

    serverCompiler.hooks.watchRun.tapPromise(pluginName, async () => {
      this.isServerCompilerRunning = true;
    });

    serverCompiler.hooks.done.tapPromise(pluginName, async (stats) => {
      if (this.isClientCompilerRunning === false && !stats.hasErrors()) {
        update();
      }

      this.isServerCompilerRunning = false;
    });

    this.handlers.push(
      rendererCompiler.watch({}, () => { }),
    );

    this.handlers.push(
      serverCompiler.watch({}, () => { }),
    );

    const startWebpackServer = async () => {
      if (this.destroyed === true) { return; }

      if (this.webpackServer !== null) {
        const server = this.webpackServer;
        this.webpackServer = null;
        webpackServerListening = false;

        await server.stop();
      }

      if (this.destroyed === true) { return; }

      this.webpackServer = new WebpackDevServer({
        ...cfg.devServer,

        devMiddleware: {
          ...cfg.devServer.devMiddleware,
          index: 'index.html',
        },

        hot: false,
        liveReload: false,

        setupMiddlewares: (middlewares, devServer) => {
          const { app } = devServer;

          // obsolete hot updates & js maps should be discarded immediately
          app.get(/(\.hot-update\.json|\.js\.map)$/, (_, res) => {
            res.status(404).send('404');
          });

          if (cfg.build.ignorePublicFolder !== true) {
            app.use(resolveUrlPath('/'), serveStatic('.', { maxAge: 0 }));
          }

          ssgMiddleware({
            app,
            banner,
            resolve: {
              urlPath: resolveUrlPath,
              route: (url) => url
                .replace(cfg.build.vueRouterBase, '/')
                .split('?')[0]
                .split('#')[0]
                .trim(),
            },
            generateRoute,
            serve: {
              fallback: (res) => {
                res.setHeader('Content-Type', 'text/html');

                res.send(fallbackHtml);
              },
              error: renderError,
            },
          });

          const newMiddlewares = cfg.devServer.setupMiddlewares(middlewares, devServer);

          return newMiddlewares;
        },
      }, clientCompiler);

      await this.webpackServer.start();
    };

    await startWebpackServer();

    if (this.destroyed === true) { return; }

    webpackServerListening = true;
    tryToFinalize();
    doneExternalWork(webpackNames.ssg.renderer);
  }

  stop() {
    this.destroyed = true;

    if (this.webpackServer !== null) {
      this.handlers.push({
        // normalize to syntax of the other handlers
        close: (doneFn) => {
          this.webpackServer.stop().finally(() => { doneFn(); });
        },
      });
    }

    return Promise.all(
      this.handlers.map((handler) => new Promise((resolve) => { handler.close(resolve); })),
    ).finally(() => {
      this.setInitialState();
    });
  }
};
