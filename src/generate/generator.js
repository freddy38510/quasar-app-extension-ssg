const { cyanBright } = require('chalk')
const fs = require('fs').promises
const minify = require('html-minifier').minify
const path = require('path')
const { log, warn, fatal } = require('./../helpers/logger')
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

    while (routes.length) {
      let n = 0
      await Promise.all(
        routes
          .splice(0, this.options.concurrency)
          .map(async (route) => {
            await new Promise(resolve => setTimeout(resolve, (n++ * this.options.interval) || 0))

            log(`${cyanBright(path.posix.join(route, 'index.html'))} => Generating...`)

            await this.generate(route)
          })
      )
    }
  }

  async generate (route) {
    try {
      let html = await this.render(route)

      if (typeof this.options.onRouteRendered === 'function') {
        log(`${cyanBright(path.posix.join(route, 'index.html'))} => Running onRouteRendered hook...`)

        html = await this.options.onRouteRendered(html, route, this.options.__distDir)
      }

      if (this.options.minify !== false) {
        html = minify(html, this.options.minify)
      }

      await this.fileWriter(path.join(this.options.__distDir, route), 'index.html', html)
    } catch (error) {
      warn(error.stack || error)

      warn(`Could not generate route: "${route}"`)
    }
  }

  async fileWriter (targetDirectory, filename, content) {
    await fs.mkdir(path.normalize(targetDirectory), { recursive: true })

    await fs.writeFile(path.join(targetDirectory, filename), content)
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
