# [Quasar-app-extension-ssg with Vite](https://quasar-app-extension-ssg-vite.netlify.app/)

A Quasar CLI project with Vite and quasar-app-extension-ssg.

## PageSpeed Insights reports

### mobile

[![mobile report](pagespeed-report-mobile.png)](https://pagespeed.web.dev/report?url=https%3A%2F%2Fquasar-app-extension-ssg-vite.netlify.app%2F&form_factor=mobile)

### desktop

[![desktop report](pagespeed-report-desktop.png)](https://pagespeed.web.dev/report?url=https%3A%2F%2Fquasar-app-extension-ssg-vite.netlify.app%2F&form_factor=desktop)

## Install the dependencies from the monorepo root folder

```bash
pnpm i
```

### Start the app in development mode for ssg (hot-code reloading, error reporting, etc.)

```bash
quasar ssg dev
```

### Lint the files

```bash
pnpm run lint
```

### Format the files

```bash
pnpm run format
```

### Build the app for production (using ssg)

```bash
quasar ssg generate
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) and [configuring quasar-app-extension-ssg for Vite](https://github.com/freddy38510/quasar-app-extension-ssg#vite).
