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
      name: 'inlineCssFromSFC',
      type: 'confirm',
      message:
        'Inline CSS from Vue SFC style tags ?',
      default: false,
    },
    {
      name: 'inlineCriticalCss',
      type: 'confirm',
      message:
        'Inline critical css and async load the rest ?',
      default: true,
    },
  ];
};
