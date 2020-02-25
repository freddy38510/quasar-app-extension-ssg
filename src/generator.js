const fs = require('fs')
const mkdirp = require('mkdirp')
const Critters = require('critters-webpack-plugin')

class Generator {
  constructor (api, quasarConf) {
    const ssr = require(`${quasarConf.build.distDir}/ssr.js`)
    const log = require(api.resolve.app('node_modules/@quasar/app/lib/helpers/logger'))

    this.api = api

    this.critters = api.prompts.criticalCss.enable ? new Critters({
      preload: api.prompts.criticalCss.preload,
      pruneSource: false,
      outputPath: ssr.resolveWWW(''),
      publicPath: quasarConf.build.publicPath,
      // bodyClasses: 'body--dark',
      logger: {
        info: function (msg) {
          const info = log('app:build')
          return info(`Extension(${api.extId}): ${msg}`)
        },
        warn: function (msg) {
          const warn = log('app:build', 'yellow')
          return warn(`⚠️  Extension(${api.extId}): ${msg}`)
        }
      }
    }) : false

    this.quasarConf = quasarConf

    this.ssr = ssr

    this.routes = require(api.resolve.app('src-static/routes.js'))()

    this.rendererOptions = this.setRendererOptions(api, quasarConf)

    this.logger = {
      log: log('app:build'),
      warn: log('app:build', 'red')
    }
  }

  setRendererOptions (api, quasarConf) {
    const rendererOptions = require(api.resolve.app('src-static/rendererOptions.js'))()

    if (rendererOptions.clientManifest && typeof rendererOptions.clientManifest === 'function') {
      const clientManifest = require(`${quasarConf.build.distDir}/vue-ssr-client-manifest.json`)

      rendererOptions.clientManifest = rendererOptions.clientManifest(clientManifest)
    }

    if (quasarConf.build.preloadChunks && this.critters && !rendererOptions.preloadChunks) {
      rendererOptions.preloadChunks = (_file, type) => {
        if (type === 'style') {
          return false
        } else {
          return true
        }
      }
    }

    return rendererOptions
  }

  async generate () {
    try {
      for (const route of this.routes) {
        this.logger.log(`Extension(${this.api.extId}): Generating route ${route}...`)

        let html = await this.render(route)

        if (this.critters) {
          this.logger.log(`Extension(${this.api.extId}): Inlining critical Css for route ${route}...`)

          html = await this.critters.process(html)
        }

        this.fileWriter(this.ssr.resolveWWW(route), 'index.html', html)
      }

      if (this.critters && this.api.prompts.fallback.enable) {
        this.logger.log(`Extension(${this.api.extId}): Inlining critical Css for fallback...`)

        let fallbackHtml = await this.critters.readFile(this.ssr.resolveWWW(this.api.prompts.fallback.filename))

        fallbackHtml = await this.critters.process(fallbackHtml)

        this.fileWriter(this.ssr.resolveWWW(''), this.api.prompts.fallback.filename, fallbackHtml)
      }
    } catch (error) {
      this.logger.warn(`Extension(${this.api.extId}): ${error}`)
    }
  }

  fileWriter (targetDirectory, filename, content) {
    if (!targetDirectory.endsWith('/')) targetDirectory += '/'

    mkdirp.sync(targetDirectory)

    fs.writeFileSync(targetDirectory + filename, content)
  }

  async render (url) {
    const req = { headers: {}, url: url }
    const res = {}

    this.ssr.mergeRendererOptions(this.rendererOptions)

    return new Promise((resolve, reject) => {
      this.ssr.renderToString({ req, res }, (error, html) => {
        if (error) {
          reject(error)
        } else {
          const minify = require('html-minifier').minify
          html = minify(html, {
            minifyCSS: true,
            minifyJS: true,
            // removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            collapseBooleanAttributes: true,
            removeScriptTypeAttributes: true
          })
          resolve(html)
        }
      })
    })
  }
}

module.exports = Generator
