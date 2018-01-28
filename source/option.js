import { createOptionParser, OPTION_CONFIG_PRESET } from 'dr-js/module/common/module/OptionParser'
import { parseOptionMap, createOptionGetter } from 'dr-js/module/node/module/ParseOption'

const { SingleString, SingleInteger } = OPTION_CONFIG_PRESET
const SingleStringPath = { ...SingleString, isPath: true }

const OPTION_CONFIG = {
  prefixENV: 'dr-city',
  formatList: [
    {
      ...SingleString,
      optional: true,
      name: 'config',
      shortName: 'c',
      description: `# from JSON: set to 'path/to/config.json'\n# from ENV: set to 'env'`
    },

    { ...SingleString, name: 'hostname', shortName: 'h' },
    { ...SingleInteger, name: 'port', shortName: 'p' },
    {
      optional: true,
      name: 'https',
      shortName: 's',
      argumentCount: '0+',
      extendFormatList: [
        { ...SingleStringPath, name: 'file-SSL-key' },
        { ...SingleStringPath, name: 'file-SSL-cert' },
        { ...SingleStringPath, name: 'file-SSL-chain' },
        { ...SingleStringPath, name: 'file-SSL-dhparam' }
      ]
    },
    { ...SingleStringPath, name: 'path-share' },
    { ...SingleStringPath, name: 'path-user' },
    { ...SingleStringPath, name: 'file-firebase-admin-token' },

    { ...SingleStringPath, optional: true, name: 'path-log', extendFormatList: [ { ...SingleString, optional: true, name: 'prefix-log-file' } ] },
    { ...SingleStringPath, optional: true, name: 'file-pid' }
  ]
}

const { parseCLI, parseENV, parseJSON, processOptionMap, formatUsage } = createOptionParser(OPTION_CONFIG)

const parseOption = async () => createOptionGetter(await parseOptionMap({ parseCLI, parseENV, parseJSON, processOptionMap }))

const exitWithError = (error) => {
  __DEV__ && console.warn(error)
  !__DEV__ && console.warn(formatUsage(error.message || error.toString()))
  process.exit(1)
}

export { parseOption, exitWithError }
