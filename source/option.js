import { Common } from 'dr-js/module/Dr.node'
const { createOptionParser, OPTION_CONFIG_PRESET } = Common.Module

const checkModeServerOption = (optionMap, optionFormatSet, format) => optionMap[ 'mode' ].argumentList[ 0 ] !== 'server'
const checkTypeHttpsOption = (optionMap, optionFormatSet, format) => optionMap[ 'type' ].argumentList[ 0 ] !== 'HTTPS'

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
        { name: 'file-firebase-admin-token', optional: checkModeServerOption, ...OPTION_CONFIG_PRESET.SingleString, isPath: true },
        { name: 'path-log', optional: checkModeServerOption, ...OPTION_CONFIG_PRESET.SingleString, isPath: true },
        { name: 'prefix-log-file', optional: checkModeServerOption, ...OPTION_CONFIG_PRESET.SingleString }
      ]
    },
    {
      name: 'type',
      shortName: 't',
      description: `protocol type, 'HTTPS' or 'HTTP'`,
      ...OPTION_CONFIG_PRESET.OneOfString([ 'HTTPS', 'HTTP' ]),
      extendFormatList: [
        { name: 'file-SSL-key', optional: checkTypeHttpsOption, ...OPTION_CONFIG_PRESET.SingleString, isPath: true },
        { name: 'file-SSL-cert', optional: checkTypeHttpsOption, ...OPTION_CONFIG_PRESET.SingleString, isPath: true },
        { name: 'file-SSL-chain', optional: checkTypeHttpsOption, ...OPTION_CONFIG_PRESET.SingleString, isPath: true },
        { name: 'file-SSL-dhparam', optional: checkTypeHttpsOption, ...OPTION_CONFIG_PRESET.SingleString, isPath: true }
      ]
    },
    { name: 'host-name', shortName: 'h', ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'port', shortName: 'p', ...OPTION_CONFIG_PRESET.SingleInteger },
    { name: 'path-resource', ...OPTION_CONFIG_PRESET.SingleString, isPath: true }
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
