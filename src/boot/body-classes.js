/* eslint-disable no-void */
// import { queues } from 'quasar/src/install.js'
import { fromSSR, client } from 'quasar/src/plugins/Platform.js'

function getMobilePlatform (is) {
  if (is.ios === true) return 'ios'
  if (is.android === true) return 'android'
}

function getBodyClasses ({ is }, cfg) {
  const cls = [
    is.desktop === true ? 'desktop' : 'mobile'
    // `${has.touch === false ? 'no-' : ''}touch`
  ]

  if (is.mobile === true) {
    const mobile = getMobilePlatform(is)
    mobile !== void 0 && cls.push('platform-' + mobile)
  }

  if (is.nativeMobile === true) {
    const type = is.nativeMobileWrapper

    cls.push(type)
    cls.push('native-mobile')

    if (
      is.ios === true &&
      (cfg[type] === void 0 || cfg[type].iosStatusBarPadding !== false)
    ) {
      cls.push('q-ios-padding')
    }
  } else if (is.electron === true) {
    cls.push('electron')
  } else if (is.bex === true) {
    cls.push('bex')
  }

  return cls
}

export default ({ app }) => {
  // queues.takeover.push(_q => {
  // SSR takeover corrections
  if (fromSSR === true) {
    const cls = getBodyClasses(client, app)

    if (client.is.ie === true && client.is.versionNumber === 11) {
      cls.forEach(c => document.body.classList.add(c))
    } else {
      document.body.classList.add.apply(document.body.classList, cls)
    }

    if (client.is.mobile === true) {
      document.body.classList.remove('desktop')
    }
  }
  // })
}
