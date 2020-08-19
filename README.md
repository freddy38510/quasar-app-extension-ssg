# Static Site Generator App Extension for Quasar, the Vue.js Framework

A Quasar app extension to generate static site AKA [JAMstack](<[https://link](https://jamstack.org/)>).

[Installing](#installing) | [Uninstalling](#uninstalling) | [Developing](#developing) | [Usage](#usage) | [Configuration](#configuration) | [About cache feature](#about-cache-feature)

## Installing

Add the App Extension into your Quasar project:

```bash
yarn add --dev https://github.com/freddy38510/quasar-app-extension-ssg
```

Then install it:

```bash
quasar ext invoke ssg
```

## Uninstalling

Remove the App Extension from your Quasar project:

```bash
yarn remove https://github.com/freddy38510/quasar-app-extension-ssg
```

Then uninstall it:

```bash
quasar ext uninvoke ssg
```

## Developing

To help developing the extension, start by cloning this repository:

```bash
git clone https://github.com/freddy38510/quasar-app-extension-ssg.git && cd quasar-app-extension-ssg
```

Register the App Extension through yarn:

```bash
yarn link
```

Create a new Quasar project then link the App Extension:

```bash
quasar create <project-name> && cd <project-name>

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

> Do not forget to set the routes you want to generate in the [configuration](#routes).

#### Generate Options

- `-h, --help`: Display usage instructions.
- `--force-build`: Force to build the application with webpack.
- `-d, --debug`: Build for debugging purposes.

### Serve

This extension provides a command to create a server for testing your static site localy:

```bash
quasar ssg serve <dist-folder>
```

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
- `--proxy <file.js>`: Proxy specific requests defined in file. File must export Array ({ path, rule }). "rule" is defined at: <https://github.com/chimurai/http-proxy-middleware>.

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

## Configuration

You can pass options with `ssg` key in `/quasar.conf.js`.

```javascript
// quasar-config.js

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

The generation of routes are concurrent, ssg.concurrency specifies the amount of routes that run in one thread.

### `interval`

Type: `Number`

Default: `0`

Interval between two render cycles to avoid flooding a potential API with API calls from the web application.

### `routes`

Type: `String[]` or `Function`

Default: `['/']`

An `Array` of `Strings` for routes to be generated.

Example:

```javascript
ssg: {
  routes: ["/", "/about", "/users", "/users/someone"];
}
```

With a `Function` which returns a `Promise`:

```javascript
// quasar-config.js

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
// quasar-config.js

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

### `rendererOptions`

Type: `Object`

Default: `{}`

The options merged with Quasar [defaults options](https://github.com/quasarframework/quasar/blob/934a6080290c219706f043fdf68f3ca9089ecc5d/app/lib/ssr/template.prod-webserver.js#L26), then pass to the `BundleRenderer` as in the [Vue SSR Guide](https://ssr.vuejs.org/api/#renderer-options).

### `onRouteRendered(html, route, distDir)`

Type: `Function`

Run hook after a route is pre-rendered just before writing it to `index.html`.

Can use async/await or directly return a Promise.

### `afterGenerate(files, distDir)`

Type: `Function`

Run hook after all pages has been generated.

Can use async/await or directly return a Promise.

> Note: `files` parameter is an `Array` of all generated routes paths + filenames (including the fallback file).

Example to generate critical CSS, inline it, and defer CSS with [Critical](https://github.com/addyosmani/critical):

```javascript
// quasar-conf.js

const critical = require('critical')
const fs = require("fs-extra");

module.exports = function (/* ctx */) {
  return {
    // ...

    ssg: {
      afterGenerate: async (files, distDir) => {

        await Promise.all(
          files.map(async (file) => {
            const { html } = await critical.generate({
              inline: true,
              src: file,
              base: distDir,
              ignore: {
                atrule: ["@font-face"],
                decl: (node, value) => /url\(/.test(value),
              },
            });

            fs.outputFile(file, html);
          })
        );
      };
    },

    // ...
  }
}
```

### About Cache Feature

The cache mechanism to avoid rebuilding the app when this is not necessary is heavily inspired by [Nuxt](https://nuxtjs.org).
See the Nuxt [blog post](https://fr.nuxtjs.org/blog/nuxt-static-improvements#faster-static-deployments) about that feature.
