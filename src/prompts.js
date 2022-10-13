/**
 * Quasar App Extension prompts script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/prompts-api
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 * Example:

  return [
    {
      name: 'name',
      type: 'string',
      required: true,
      message: 'Quasar CLI Extension name (without prefix)',
    },
    {
      name: 'preset',
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [
        {
          name: 'Install script',
          value: 'install'
        },
        {
          name: 'Prompts script',
          value: 'prompts'
        },
        {
          name: 'Uninstall script',
          value: 'uninstall'
        }
      ]
    }
  ]

 */

const { hasPackage } = require('./webpack/helpers/packages');

const hasVite = hasPackage('@quasar/app-vite');

module.exports = function prompts() {
  return [
    {
      name: 'scripts',
      type: 'confirm',
      message:
        'Add scripts into your package.json ?',
      default: true,
    },
    {
      name: 'IDE',
      type: 'confirm',
      message:
      'Add auto-completion of ssg property of quasar.config.js file for IDE ?',
      default: true,
    },
    {
      name: 'inlineCriticalCss',
      type: 'confirm',
      message:
        'Inline critical css and async load the rest ?',
      default: true,
    },
    ...hasVite ? []
      : [{
        name: 'inlineCssFromSFC',
        type: 'confirm',
        message:
          'Inline CSS from Vue SFC <style> blocks ?',
        default: false,
      }],
  ];
};
