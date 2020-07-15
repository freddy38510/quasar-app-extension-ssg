const fs = require('fs')
const mkdirp = require('mkdirp')
const Critters = require('critters-webpack-plugin')
const { green, red } = require('chalk')

class Generator {
  constructor (api, quasarConf) {
    const banner = `Extension(${api.extId}) ·`

    const logBanner = green(banner)
    const warnBanner = red(banner)

    const logger = {
      log: function (msg) {
        console.log(msg ? ` ${logBanner} ${msg}` : '')
      },
      warn: function (msg) {
        console.warn(msg ? ` ${warnBanner} ⚠️  ${msg}` : '')
      }
    }

    const ssr = require(`${quasarConf.build.distDir}/ssr.js`)

    this.api = api

    this.critters = api.prompts.criticalCss.enable ? new Critters({
      preload: api.prompts.criticalCss.preload,
      pruneSource: false,
      outputPath: ssr.resolveWWW(''),
      publicPath: quasarConf.build.publicPath,
      // bodyClasses: 'body--dark',
      logger: {
        info: function (msg) {
          return logger.log(msg)
        },
        warn: function (msg) {
          return logger.warn(msg)
        }
      }
    }) : false

    this.quasarConf = quasarConf

    this.ssr = ssr

    this.routes = require(api.resolve.app('src-ssg/routes.js'))()

    this.rendererOptions = this.setRendererOptions(api, quasarConf)

    this.logger = logger
  }

  setRendererOptions (api, quasarConf) {
    const rendererOptions = require(api.resolve.app('src-ssg/rendererOptions.js'))()

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
        this.logger.log(`Generating route ${route}...`)

        let html = await this.render(route)

        if (this.critters) {
          this.logger.log(`Inlining critical Css for route ${route}...`)

          html = await this.critters.process(html)
        }

        this.fileWriter(this.ssr.resolveWWW(route), 'index.html', html)
      }

      if (this.critters && this.api.prompts.fallback.enable) {
        this.logger.log('Inlining critical Css for fallback...')

        let fallbackHtml = await this.critters.readFile(this.ssr.resolveWWW(this.api.prompts.fallback.filename))

        fallbackHtml = await this.critters.process(fallbackHtml)

        this.fileWriter(this.ssr.resolveWWW(''), this.api.prompts.fallback.filename, fallbackHtml)
      }
    } catch (error) {
      this.logger.warn(error)
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
