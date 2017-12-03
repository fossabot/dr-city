import { Common, Node } from 'dr-js/module/Dr.node'

const { createOptionParser, OPTION_CONFIG_PRESET } = Common.Module
const { parseOptionMap, getOptionOptional, getSingleOptionOptional, getOption, getSingleOption } = Node.Module

const SingleStringPathFormat = { ...OPTION_CONFIG_PRESET.SingleString, isPath: true }
const HttpsOptionFormat = { optional: (optionMap) => optionMap[ 'protocol' ].argumentList[ 0 ] !== 'https:', ...SingleStringPathFormat }

const OPTION_CONFIG = {
  prefixENV: 'dr-city',
  formatList: [
    {
      ...OPTION_CONFIG_PRESET.SingleString,
      name: 'config',
      shortName: 'c',
      optional: true,
      description: `# from JSON: set to 'path/to/config.json'\n# from ENV: set to 'env'`
    },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'hostname', shortName: 'h' },
    { ...OPTION_CONFIG_PRESET.SingleInteger, name: 'port', shortName: 'p' },
    {
      ...OPTION_CONFIG_PRESET.OneOfString([ 'https:', 'http:' ]),
      name: 'protocol',
      shortName: 't',
      extendFormatList: [
        { ...HttpsOptionFormat, name: 'file-SSL-key' },
        { ...HttpsOptionFormat, name: 'file-SSL-cert' },
        { ...HttpsOptionFormat, name: 'file-SSL-chain' },
        { ...HttpsOptionFormat, name: 'file-SSL-dhparam' }
      ]
    },
    { ...SingleStringPathFormat, name: 'path-share' },
    { ...SingleStringPathFormat, name: 'path-user' },
    {
      ...SingleStringPathFormat,
      name: 'path-log',
      optional: true,
      extendFormatList: [
        { ...OPTION_CONFIG_PRESET.SingleString, name: 'prefix-log-file', optional: true }
      ]
    },
    { ...SingleStringPathFormat, name: 'file-pid', optional: true },
    { ...SingleStringPathFormat, name: 'file-firebase-admin-token' }
  ]
}

const { parseCLI, parseENV, parseJSON, processOptionMap, formatUsage } = createOptionParser(OPTION_CONFIG)

const parseOption = async () => ({
  optionMap: await parseOptionMap({ parseCLI, parseENV, parseJSON, processOptionMap }),
  getOption,
  getOptionOptional,
  getSingleOption,
  getSingleOptionOptional
})

const exitWithError = (error) => {
  __DEV__ && console.warn(error)
  !__DEV__ && console.warn(formatUsage(error.message || error.toString()))
  process.exit(1)
}

export { parseOption, exitWithError }
