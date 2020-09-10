const { green, red, cyanBright } = require('chalk')

const banner = 'Extension(ssg) ·'

const logBanner = green(banner)
const warnBanner = red(banner)

module.exports.log = function (msg) {
  console.log(msg ? ` ${logBanner} ${msg}` : '')
}

module.exports.warn = function (msg) {
  console.warn(msg ? ` ${warnBanner} ⚠️  ${msg}` : '')
}

module.exports.fatal = function (msg) {
  console.error(msg ? ` ${warnBanner} ⚠️  ${msg}` : '')
  process.exit(1)
}

module.exports.routeBanner = function (route, msg) {
  return msg ? ` ${logBanner} ${msg} ${cyanBright(route)}` : ''
}
