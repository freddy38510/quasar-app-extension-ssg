# Static Site Generator App Extension for Quasar, the Vue.js Framework

> A [Quasar v1](https://v1.quasar.dev/) App Extension to generate static site AKA [JAMstack](https://jamstack.org).

![npm](https://img.shields.io/npm/v/quasar-app-extension-ssg/quasar-v1) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/freddy38510/quasar-app-extension-ssg) ![GitHub repo size](https://img.shields.io/github/repo-size/freddy38510/quasar-app-extension-ssg) ![npm](https://img.shields.io/npm/dt/quasar-app-extension-ssg) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This project was created to fill this [Feature Request](https://github.com/quasarframework/quasar/issues/2299) from Quasar.

:warning: If you are using the new [Quasar v2](https://quasar.dev/start/upgrade-guide), please use and see the latest [quasar-app-extension-ssg](https://github.com/freddy38510/quasar-app-extension-ssg) documentation.

[Installing](#installing) | [Uninstalling](#uninstalling) | [Upgrading](#upgrading) | [Developing](#developing) | [Usage](#usage) | [Configuration](#configuration) | [Infos](#infos)

## Installing

Run this command into your Quasar project:

```bash
quasar ext add ssg@quasar-v1
```

This will find and install the extension’s module. After installation is complete, there will be prompts asking you to make choices.

### Prompts

- `add scripts into your package.json?`: Extends your package.json by adding scripts.

  ```javascript
  scripts: {
    'build:ssg': 'quasar ssg generate',
    'serve:ssg': 'quasar ssg serve dist/ssg'
  }
  ```

- `Inline CSS from Vue SFC style tags ?`: Add support for [vue-style-loader](https://github.com/vuejs/vue-style-loader) to inline critical css coming from Vue SFC `<style></style>` tags.

- `Inline critical CSS and async load the rest ?`: Use [Beastcss](https://github.com/freddy38510/beastcss) to inline critical CSS and async load the rest for each generated route.

## Uninstalling

```bash
quasar ext remove ssg
```

## Upgrading

This is done with the same command as used for installation:

```bash
quasar ext add ssg@quasar-v1
```

## Developing

To help developing the extension for [Quasar v1](https://v1.quasar.dev/), start by cloning the branch [2.x](https://github.com/freddy38510/quasar-app-extension-ssg/tree/2.x) of the repository:

```bash
git clone --branch 2.x --single-branch https://github.com/freddy38510/quasar-app-extension-ssg.git quasar-app-extension-ssg-v2

cd quasar-app-extension-ssg-v2
```

Register the App Extension through yarn:

```bash
yarn link
```

Install dependencies:

```bash
yarn
```

Create a new Quasar project then link the App Extension:

```bash
quasar create --branch v1 <project-name> && cd <project-name>

yarn link quasar-app-extension-ssg
```

Finally install the App Extension:

```bash
quasar ext invoke ssg
```

Now, you can developp this App Extension without uninstall/install it each time you change something in it.

## Usage

### Generate

To generate a static site run this command from your quasar project folder:

```bash
quasar ssg generate
```

#### Generate Options

- `-h, --help`: Display usage instructions.
- `--force-build`: Force to build the application with webpack.
- `--fail-on-error`: Exit with non-zero status code if there are errors when generating pages.
- `-d, --debug`: Build for debugging purposes.

### Serve

This extension provides a command to create a server for testing your static site locally:

```bash
quasar ssg serve <dist-folder>
```

> Notes: This server is based on the [Quasar cli server](https://github.com/quasarframework/quasar/blob/dev/cli/bin/quasar-serve) adapted for static site. It handles SPA or PWA fallback.

#### Serve Options

- `--port, -p`: Port to use (default: 4000).
- `--hostname, -H`: Address to use (default: 0.0.0.0).
- `--prefix-path`: Create a virtual path prefix (default: /).
- `--gzip, -g`: Compress content (default: true).
- `--silent, -s`: Suppress log message.
- `--colors`: Log messages with colors (default: true).
- `--open, -o`: Open browser window after starting.
- `--cache, -c <number>`: Cache time (max-age) in seconds. Does not apply to /service-worker.js (default: 86400 - 24 hours).
- `--micro, -m <seconds>`: Use micro-cache (default: 1 second).
- `--https`: Enable HTTPS.
- `--cert, -C [path]`: Path to SSL cert file (Optional).
- `--key, -K [path]`: Path to SSL key file (Optional).
- `--proxy <file.js>`: Proxy specific requests defined in file. File must export Array ({ path, rule }). "rule" is defined at: <https://github.com/chimurai/http-proxy-middleware/tree/v0.19.1#readme>.

  ```javascript
  module.exports = [
    {
      path: "/api",
      rule: { target: "http://www.example.org" },
    },
  ];
  // will be transformed into app.use(path, httpProxyMiddleware(rule))
  ```

- `--cors`: Enable CORS for all requests.
- `--help, -h`: Display usage instructions.

### Inspect

This command can be used to inspect the Webpack config generated by this app extension.

```bash
quasar ssg inspect
```

#### Inspect Options

- `-d, --depth`: Number of levels deep (default: 5).
- `-p, --path`: Path of config in dot notation.
- `--colors`: Style output with ANSI color codes.

  Examples:

  ```bash
  quasar ssg inspect -p module.rules
  quasar ssg inspect -p plugins
  ```

- `-h, --help`: Display usage instructions.

## Configuration

You can pass options with `ssg` key in `/quasar.conf.js`.

```javascript
// quasar.conf.js

module.exports = function (/* ctx */) {
  return {
    // ...

    ssg: {
      // pass options here
    },

    // ...
  };
};
```

See all availables options below:

### `concurrency`

Type: `Number`

Default: `10`

The generation of routes are concurrent, `ssg.concurrency` specifies the amount of routes that run in one thread.

### `interval`

Type: `Number`

Default: `0`

Interval in **milliseconds** between two batches of concurrently pages generation to avoid flooding a potential API with API calls from the web application.

> Notes:
>
> This option is intended to be used in conjunction with the `concurrency` option.

### `routes`

Type: `String[]` or `Function`

Default: `[]`

An `Array` of `Strings` for routes to be generated.

> Note: As of quasar-app-extension-ssg [v2.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.2.0...v2.0.0) this option is no longer necessary thanks to the crawler feature and the ability to include static routes from the router using `ssg.includeStaticRoutes` option.
>
> If have unlinked pages (such as secret pages) and you would like these to also be generated then you can use the ssg.routes property.

Example:

```javascript
ssg: {
  routes: ["/", "/about", "/users", "/users/someone"];
}
```

With a `Function` which returns a `Promise`:

```javascript
// quasar.conf.js

const axios = require("axios");

module.exports = function (/* ctx */) {
  return {
    // ...

    ssg: {
      routes() {
        return axios.get("https://my-api/users").then((res) => {
          return res.data.map((user) => {
            return "/users/" + user.id;
          });
        });
      },
    },

    // ...
  };
};
```

With a `Function` which returns a `callback(err, params)`:

```javascript
// quasar.conf.js

const axios = require("axios");

module.exports = function (/* ctx */) {
  return {
    // ...

    ssg: {
      routes(callback) {
        axios
          .get("https://my-api/users")
          .then((res) => {
            const routes = res.data.map((user) => {
              return "/users/" + user.id;
            });
            callback(null, routes);
          })
          .catch(callback);
      },
    },

    // ...
  };
};
```

### `includeStaticRoutes`

:new: _Added in [v2.4.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.3.0...v2.4.0)_

Type: `Boolean`

Default: `true`

Include the application router static routes to generate the corresponding pages.

> Note: In case of warnings issued when initializing routes you can disable this option and let the crawler find your static and dynamic routes or provide them via the option `ssg.routes`.

### `buildDir`

Type: `String`

Default: `'<project-folder>/node_modules/.cache/quasar-app-extension-ssg'` or `'<project-folder>/.ssg-build'` if `cache` is set to false.

The webpack build output folder from where the extension can prerender pages.

### `cache`

Type: `Object` or `false`

Default:

```javascript
{
  ignore: [
    join(ssg.__distDir, '/**'), // dist/ssg
    join(ssg.buildDir, '/**'), // node_modules/.cache/quasar-app-extension-ssg
    'dist/**',
    'public/**',
    'src-ssr/**',
    'src-cordova/**',
    'src-electron/**',
    'src-bex/**',
    'node_modules/**',
    '.**/*',
    '.*',
    'README.md'
  ],
  globbyOptions: {
    gitignore: true
  }
}
```

This option is used to avoid re-building when no tracked file has been changed.

- `ignore` is a [Globby](https://github.com/sindresorhus/globby#patterns) patterns to ignore tracked files. If an array is provided, it will be merged with default options, you can give a function to return an array that will remove the defaults.

  Example with an `Array`:

  ```javascript
  ssg: {
    cache: {
      ignore: ["renovate.json"]; // ignore changes applied on this file
    }
  }
  ```

  With a `Function`:

  ```javascript
  ssg: {
    cache: {
      ignore: (defaultIgnore) =>
        defaultIgnore.push("renovate.json") && defaultIgnore;
    }
  }
  ```

- `globbyOptions` can be used to add [globby options](https://github.com/sindresorhus/globby#options).

### `fallback`

Type: `String`

Default: `'404.html'`

The filename of the full SPA or PWA page as a fallback when an index.html file does not exist for a given route.

> Notes:
>
> - Overrides `build.htmlFilename` and `build.ssrPwaHtmlFilename`.
> - This file is created with `html-webpack-plugin` with [defaults options](https://github.com/quasarframework/quasar/blob/dev/app/lib/webpack/inject.html.js) set by Quasar. You can extend it with some [plugins](https://github.com/jantimon/html-webpack-plugin#plugins).

### `crawler`

:new: _Added in [v2.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.2.0...v2.0.0)_

Type: `Boolean`

Default: `true`

Crawl your relative links and generate your dynamic links based on these links.

### `exclude`

:new: _Added in [v2.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.2.0...v2.0.0)_
Type: `String[] | Regexp[]`

It accepts an array of string or regular expressions and will prevent generation of routes matching them.

Example with an `Array of String`:

```javascript
ssg: {
  exclude: ["/my-secret-page"];
}
```

With an `Array of Regexp`:

```javascript
ssg: {
  exclude: [
    /^\/admin/, // path starts with /admin
  ];
}
```

### `rendererOptions`

Type: `Object`

Default: `{}`

The options merged with Quasar [defaults options](https://github.com/quasarframework/quasar/blob/934a6080290c219706f043fdf68f3ca9089ecc5d/app/lib/ssr/template.prod-webserver.js#L26), then passed to the `BundleRenderer`. See the [Vue SSR Guide](https://ssr.vuejs.org/api/#renderer-options) for available options.

### `inlineCriticalCss`

Type: `Boolean` or `Object`

Default: `true`

Use [Beastcss](https://github.com/freddy38510/beastcss) to inline critical CSS and async load the rest for each generated route.

You can customize the default beastcss options by passing it to `inlineCriticalCss`.

Example:

```javascript
ssg: {
  inlineCriticalCss: {
    internal: false,
    merge: false,
  };
}
```

> Note: This option is useful to avoid [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) on first load page in browser because it inlines css coming from async css chunk dynamically injected into the document.

### `inlineCssFromSFC`

:new: _Added in [v2.0.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v1.2.0...v2.0.0)_

Type: `Boolean`

Default: `false`

Add support for [vue-style-loader](https://github.com/vuejs/vue-style-loader) to inline critical css coming from Vue SFC `<style></style>` tags.

> Note: This option works even if [`build.extractCSS`](https://v1.quasar.dev/quasar-cli/quasar-conf-js#property-build) is set to `true` in `quasar.conf.js` file.

### `onRouteRendered(html, route, distDir)`

Type: `Function`

Run hook after a route is pre-rendered just before writing it to `index.html`.

Can use async/await or directly return a Promise.

### `afterGenerate(files, distDir)`

Type: `Function`

Run hook after all pages has been generated.

Can use async/await or directly return a Promise.

> Note: `files` parameter is an `Array` of all generated routes paths + filenames (including the fallback file).

## Tips

### Deployment

It could be useful to return a non-zero status code when a page error is encountered and let the CI/CD fail the deployment or build. To achieve that use the [`--fail-on-error`](#generate-options) argument.

> Note: The `--fail-on-error` argument is set to `true` by default since [v2.4.0](https://github.com/freddy38510/quasar-app-extension-ssg/compare/v2.3.0...v2.4.0).

### `process.env.STATIC`

The property `STATIC` is added to `process.env` once the App Extension is installed.

`process.env.STATIC` is `true` when your app was built with the command `quasar ssg generate`, and `false` when it don't.

It could be useful if you mixed several builds with differents modes to differentiate runtime procedures.

## Infos

### About Boot File

This Extension is using a boot file called [`body-classes.js`](https://github.com/freddy38510/quasar-app-extension-ssg/blob/master/src/boot/body-classes.js), only at client-side, to set platform classes to `<body>` tag like [Quasar does it](https://github.com/quasarframework/quasar/blob/dev/ui/src/body.js) originally.

This is necessary because the server used to prerender pages can't know the platform (desktop or mobile, etc) of the client at build time.

### About PWA

Quasar is using [workbox-webpack-plugin](https://github.com/GoogleChrome/workbox/tree/v6/packages/workbox-webpack-plugin) to generate a complete service worker and a list of assets to precache that is injected into a service worker file.

This means that all generated pages could not be precached when webpack is compiling because they do not exist yet at this time.
To fix this issue, the extension uses [workbox-build](https://github.com/GoogleChrome/workbox/tree/v6/packages/workbox-build) instead after all pages have been generated.

Consequently, when PWA is enabled in Quasar, you should pass options from [workbox-build](https://developers.google.com/web/tools/workbox/modules/workbox-build) for [generateSW mode](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW) or [injectManifest mode](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.injectManifest) in the key `pwa.workboxOptions` in `quasar.conf.js` file instead of options from [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin). All others PWA options from the key `pwa` in `quasar.conf.js` file are valids and used following [Quasar documentation](https://v1.quasar.dev/quasar-cli/developing-pwa/configuring-pwa#quasar-conf-js).

### About Cache Feature

The cache mechanism to avoid rebuilding the app when this is not necessary is heavily inspired by [Nuxt](https://nuxtjs.org).
See the Nuxt [blog post](https://fr.nuxtjs.org/blog/nuxt-static-improvements#faster-static-deployments) about that feature.
