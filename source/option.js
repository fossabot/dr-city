import { Common } from 'dr-js/module/Dr.node'
const { createOptionParser, OPTION_CONFIG_PRESET } = Common.Module

const checkModeServerOption = (optionMap, optionFormatSet, format) => optionMap[ 'mode' ].argumentList[ 0 ] !== 'server'
const checkTypeHttpsOption = (optionMap, optionFormatSet, format) => optionMap[ 'protocol' ].argumentList[ 0 ] !== 'https:'

const CommonSingleStringPathFormat = { ...OPTION_CONFIG_PRESET.SingleString, isPath: true }
const CommonHttpsOptionFormat = { optional: checkTypeHttpsOption, ...CommonSingleStringPathFormat }

const OPTION_CONFIG = {
  prefixENV: 'dr-city',
  formatList: [
    {
      name: 'config',
      shortName: 'c',
      optional: true,
      description: `# from JSON: set to path relative process.cwd()\n# from ENV: set to 'env' to collect from process.env`,
      ...OPTION_CONFIG_PRESET.SingleString
    },
    {
      name: 'mode',
      shortName: 'm',
      description: `should be 'server' or 'certbot'`,
      ...OPTION_CONFIG_PRESET.OneOfString([ 'server', 'certbot' ]),
      extendFormatList: [
        { name: 'hostname', shortName: 'h', ...OPTION_CONFIG_PRESET.SingleString },
        { name: 'port', shortName: 'p', ...OPTION_CONFIG_PRESET.SingleInteger },
        {
          name: 'protocol',
          shortName: 't',
          description: `protocol type, 'https:' or 'http:'`,
          ...OPTION_CONFIG_PRESET.OneOfString([ 'https:', 'http:' ]),
          extendFormatList: [
            { name: 'file-SSL-key', ...CommonHttpsOptionFormat },
            { name: 'file-SSL-cert', ...CommonHttpsOptionFormat },
            { name: 'file-SSL-chain', ...CommonHttpsOptionFormat },
            { name: 'file-SSL-dhparam', ...CommonHttpsOptionFormat }
          ]
        },
        { name: 'path-resource', ...CommonSingleStringPathFormat },
        { name: 'path-static', optional: checkModeServerOption, ...CommonSingleStringPathFormat },
        { name: 'path-user', optional: checkModeServerOption, ...CommonSingleStringPathFormat },
        {
          name: 'path-log',
          optional: true,
          ...CommonSingleStringPathFormat,
          extendFormatList: [ { name: 'prefix-log-file', optional: true, ...OPTION_CONFIG_PRESET.SingleString } ]
        },
        { name: 'file-pid', optional: true, ...CommonSingleStringPathFormat },
        { name: 'file-firebase-admin-token', optional: checkModeServerOption, ...CommonSingleStringPathFormat }
      ]
    }
  ]
}

const {
  parseCLI,
  parseENV,
  parseJSON,
  processOptionMap,
  formatUsage
} = createOptionParser(OPTION_CONFIG)

const exitWithError = (error) => {
  __DEV__ && console.warn(error)
  console.warn(formatUsage(error.message || error.toString()))
  process.exit(1)
}

export {
  parseCLI,
  parseENV,
  parseJSON,
  processOptionMap,
  exitWithError
}
