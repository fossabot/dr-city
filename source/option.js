import { Common } from 'dr-js/library/Dr.node'
const { createOptionParser, OPTION_CONFIG_PRESET } = Common.Module

const OPTION_CONFIG = {
  prefixENV: 'dr-city',
  formatList: [
    {
      name: 'mode',
      shortName: 'm',
      description: `should be 'server' or 'certbot'`,
      ...OPTION_CONFIG_PRESET.OneOfString([ 'server', 'certbot' ])
    },
    {
      name: 'type',
      shortName: 't',
      description: `protocol type, 'HTTPS' or 'HTTP'`,
      ...OPTION_CONFIG_PRESET.OneOfString([ 'HTTPS', 'HTTP' ])
    },
    {
      name: 'config',
      shortName: 'c',
      optional: true,
      description: `# from JSON: set to path relative process.cwd()\n# from ENV: set to 'env' to collect from process.env`,
      ...OPTION_CONFIG_PRESET.SingleString
    },
    { name: 'host-name', shortName: 'h', ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'port', shortName: 'p', ...OPTION_CONFIG_PRESET.SingleInteger },
    { name: 'path-log', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'prefix-log-file', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'path-resource', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'file-SSL-key', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'file-SSL-cert', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'file-SSL-chain', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'file-SSL-dhparam', optional: true, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'file-firebase-admin-token', optional: true, ...OPTION_CONFIG_PRESET.SingleString }
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
