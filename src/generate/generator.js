const fs = require('fs').promises
const minify = require('html-minifier').minify
const { Listr } = require('listr2')
const path = require('path')
const { warn, fatal, routeBanner } = require('./../helpers/logger')
const promisifyRoutes = require('./../helpers/promisify-routes')

class Generator {
  constructor (api, quasarConf) {
    const ssr = require(`${quasarConf.build.distDir}/ssr-config`)

    ssr.mergeRendererOptions(quasarConf.ssg.rendererOptions)

    this.ssr = ssr

    this.api = api

    this.options = {
      ...quasarConf.ssg,
      minify: quasarConf.build.minify
    }
  }

  async initRoutes (...args) {
    try {
      return await promisifyRoutes(
        this.options.routes,
        ...args
      )
    } catch (error) {
      warn(error.stack || error)

      fatal('Could not resolve routes')
    }
  }

  async generateAll () {
    const routes = await this.initRoutes()

    let n = 0

    try {
      await new Listr(
        routes
          .map((route) => {
            return {
              title: routeBanner(route, 'Generating route...'),
              task: async () => {
                await new Promise(resolve => setTimeout(resolve, (n++ * this.options.interval) || 0))

                await this.generate(route)
              },
              options: { persistentOutput: true }
            }
          }),
        {
          concurrent: this.options.concurrency,
          rendererOptions: {
            collapse: false,
            collapseErrors: false,
            exitOnError: true,
            showTimer: true
          }
        }
      ).run()
    } catch (e) {
      warn(e.stack || e)
      process.exit(0)
    }
  }

  async generate (route) {
    let html = await this.render(route)

    if (typeof this.options.onRouteRendered === 'function') {
      html = await this.options.onRouteRendered(html, route, this.options.__distDir)
    }

    if (this.options.minify !== false) {
      html = minify(html, this.options.minify)
    }

    await this.fileWriter(path.join(this.options.__distDir, route, 'index.html'), html)
  }

  async fileWriter (route, content) {
    try {
      await fs.mkdir(path.dirname(route), { recursive: true })

      await fs.writeFile(route, content)
    } catch (error) {
      warn(error.stack || error)
    }
  }

  render (route) {
    return new Promise((resolve, reject) => {
      const opts = {
        req: { headers: {}, url: route },
        res: {}
      }

      this.ssr.renderToString(opts, (error, html) => {
        if (error) {
          reject(error)
        }
        resolve(html)
      })
    })
  }
}

module.exports = Generator
