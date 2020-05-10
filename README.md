# Static Site Generator App Extension for Quasar, the Vue.js Framework

## Warning
This extension for Quasar is an early-stage extension and under active development. Use at your own risk.

## Development/Testing
If you're interested in assisting with testing or development, you can get started using the following steps:

1. cd into your quasar directory or run
    ````bash
    quasar create test-ext && cd test-ext
    ````
1. Install a couple dependencies:
    ````bash
    yarn add --dev https://github.com/freddy38510/quasar-app-extension-ssg critters-webpack-plugin
    ````
1. Manually add the extension:
    ````bash
    quasar ext add ssg
    ````
    You might want to say no to using critter; there may be an issue with that option.
1. If you don't have a second page defined in `src/router/routes.js`, do so now, e.g.,
    ````javascript
    const routes = [
      {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
          { path: '', component: () => import('pages/Index.vue') },
          { path: 'test', component: () => import('pages/Test.vue') }
        ]
      }
    ]
    ````
1. Modify `src-ssg/routes.js` to include your routes, e.g.,
    ````javascript
    module.exports = function () {
     return ['/', '/test']
    }
    ````
1. Run build using the SSR mode (we're discussing a separte command specifically for this extension):
    ````bash
    quasar build -m ssr
    ````
1. Take a look at the `dist/ssr/www` directory and notice that you have, e.g., `test/index.html` there. Test by running a static server at that location
    ````bash
    npx http-server dist/ssr/www/
    ````
    and browse to the routes you added above.
 
 ## Better docs coming soon; contributions welcome!
