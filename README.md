# Static Site Generator App Extension for Quasar, the Vue.js Framework

## Warning
This extension for Quasar is an early-stage extension and under active development. Use at your own risk.

## How to use
If you're interested in assisting with testing or development, you can get started using the following steps:

1. cd into your quasar directory or run
    ````bash
    quasar create test-ext && cd test-ext
    ````
1. Add the app extension dependency:
    ````bash
    yarn add --dev https://github.com/freddy38510/quasar-app-extension-ssg
    ````
1. Install the app extension:
    ````bash
    quasar ext invoke ssg
    ````
1. Configure your quasar app to use the `vueRouterMode: 'history'` rather than `hash` in `quasar.conf.js`.
1. Optionnaly create a route for catching 404 since your website will operate as a SPA for subsequent navigations, e.g:
    ```javascript
    // src/router/routes.js
    { path: '*', component: () => import('pages/error404.vue') }
    ```
1. Edit `src-ssg/routes.js` to define the routes you want to be generated for statics webpages, e.g.,
    ````javascript
    module.exports = function () {
     return ['/', '/about', '/users', '/users/1', '/users/2']
    }
    ````
1. Build your website with static pages ready for production:
    ````bash
    quasar ssg build
    ````
    or
    
    ````bash
    quasar build -m ssr --static
    ````
1. The output built with all pages and assets is located at './dist/ssr/www' by default. Test it by running a static server at that location
    ````bash
    quasar serve dist/ssr/www/
    ````
    or
    
    ````bash
    npx http-server dist/ssr/www/
    ````
 
 ## Better docs coming soon; contributions welcome!
