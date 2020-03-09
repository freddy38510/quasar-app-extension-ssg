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

module.exports = function () {
  return [
    {
      name: 'enable',
      type: 'confirm',
      message: 'Enable SSG:',
      required: true,
      default: true
    },
    {
      name: 'fallback.enable',
      type: 'confirm',
      message: 'Enable SPA Fallback:',
      required: true,
      default: true
    },
    {
      name: 'fallback.filename',
      type: 'input',
      required: true,
      message:
        'Set the path to the SPA fallback:',
      validate: (input) => {
        if (typeof input !== 'string') return 'Only String are valid'
        return true
      },
      default: '404.html',
      when: (answers) => {
        return answers.fallback.enable
      }
    },
    {
      name: 'criticalCss.enable',
      type: 'confirm',
      required: true,
      message:
        'Enable CriticalCss:',
      default: true
    },
    {
      name: 'criticalCss.preload',
      type: 'list',
      required: true,
      when: (answers) => {
        return answers.criticalCss.enable
      },
      message:
        'Preload strategy:',
      choices: [
        {
          name: 'default',
          value: '',
          short: 'default'
        },
        {
          name: 'media',
          value: 'media',
          short: 'media'
        },
        {
          name: 'swap',
          value: 'swap',
          short: 'swap'
        },
        {
          name: 'js',
          value: 'js',
          short: 'js'
        },
        {
          name: 'js-lazy',
          value: 'js-lazy',
          short: 'js-lazy'
        },
        {
          name: 'disabled',
          value: false,
          short: 'disabled'
        }
      ]
    }
  ]
}
