#!/usr/bin/env node

// eslint-disable-next-line no-void
if (process.env.NODE_ENV === void 0) {
  process.env.NODE_ENV = 'production'
}

const parseArgs = require('minimist')
const appRequire = require('./../helpers/app-require')
const { fatal } = require('./../helpers/logger')
const ensureBuild = require('../build/ensureBuild')

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'debug',
    h: 'help'
  },
  boolean: ['h', 'd', 'force-build'],
  default: {
    'force-build': false
  }
})

if (argv.help) {
  console.log(` Description
   Generate static site of your app.
 Usage
   $ quasar ssg generate
 Options
   --force-build   Force to build the application with webpack
   --debug, -d     Build for debugging purposes

   --help, -h      Displays this message
  `)
  process.exit(0)
}

module.exports = async function run (api) {
  const hasNewQuasarConf = require('./../helpers/is-pkg-gte')(api, '@quasar/app', '2.0.1')
  const QuasarConfig = appRequire(hasNewQuasarConf ? '@quasar/app/lib/quasar-conf-file' : '@quasar/app/lib/quasar-config', api.appDir)
  const getQuasarCtx = appRequire('@quasar/app/lib/helpers/get-quasar-ctx', api.appDir)
  const extensionRunner = appRequire('@quasar/app/lib/app-extension/extensions-runner', api.appDir)

  const ctx = getQuasarCtx({
    mode: 'ssr',
    target: undefined,
    arch: undefined,
    bundler: undefined,
    debug: argv.debug,
    prod: true,
    publish: undefined
  })

  await extensionRunner.registerExtensions(ctx)

  const quasarConfig = await new QuasarConfig(ctx)

  try {
    await quasarConfig.prepare()
  } catch (e) {
    console.log(e)
    fatal('[FAIL] quasar.conf.js has JS errors')
  }

  await quasarConfig.compile()

  await ensureBuild(api, quasarConfig, ctx, extensionRunner, argv['force-build'])

  await require('./../generate')(api, hasNewQuasarConf ? quasarConfig.quasarConf : quasarConfig.getBuildConfig())
}
