import nodeModulePath from 'path'
import nodeModuleFs from 'fs'
import { promisify } from 'util'
import { configureServer } from './server'
import { configureServerCertBot } from './serverCertbot'
import { parseCLI, parseENV, parseJSON, processOptionMap, exitWithError } from './option'

const readFileAsync = promisify(nodeModuleFs.readFile)

const main = async () => {
  let optionMap = optionMapResolvePath(parseCLI(process.argv), process.cwd())

  const getSingleOption = (name) => getSingleOptionOptional(name) || exitWithError(new Error(`[option] missing option ${name}`))
  const getSingleOptionOptional = (name) => optionMap[ name ] && optionMap[ name ].argumentList[ 0 ]

  const config = getSingleOptionOptional('config')
  if (config && config.toLowerCase() === 'env') {
    const envOptionMap = optionMapResolvePath(parseENV(process.env), process.cwd())
    optionMap = { ...envOptionMap, ...optionMap }
  } else if (config) {
    const jsonOptionMap = optionMapResolvePath(parseJSON(JSON.parse(await readFileAsync(config, 'utf8'))), nodeModulePath.dirname(config))
    optionMap = { ...jsonOptionMap, ...optionMap }
  }

  __DEV__ && console.log('[option]')
  __DEV__ && Object.keys(optionMap).forEach((name) => console.log(`  - [${name}] ${getSingleOption(name)}`))

  optionMap = processOptionMap(optionMap)
  __DEV__ && console.log('processOptionMap PASS')

  const mode = getSingleOption('mode')
  const hostName = getSingleOption('host-name')
  const pathResource = getSingleOption('path-resource')

  if (mode === 'server') {
    const protocol = getSingleOption('type')
    const { start } = await configureServer({
      protocol,
      hostName,
      port: getSingleOption('port'),
      ...(protocol === 'HTTPS' ? {
        fileSSLKey: getSingleOption('file-SSL-key'),
        fileSSLCert: getSingleOption('file-SSL-cert'),
        fileSSLChain: getSingleOption('file-SSL-chain'),
        fileSSLDHParam: getSingleOption('file-SSL-dhparam')
      } : {}),
      fileFirebaseAdminToken: getSingleOption('file-firebase-admin-token'),
      pathResource,
      pathLog: getSingleOption('path-log'),
      logFilePrefix: getSingleOption('prefix-log-file')
    })
    return start()
  }

  if (mode === 'certbot') {
    const { start } = await configureServerCertBot({ hostName, pathResource })
    return start()
  }

  throw new Error(`[main] strange error`)
}

const optionMapResolvePath = (optionMap, pathRelative) => {
  Object.values(optionMap).forEach(({ format: { isPath }, argumentList }) => isPath && argumentList.forEach((v, i) => (argumentList[ i ] = nodeModulePath.resolve(pathRelative, v))))
  return optionMap
}

main().catch(exitWithError)
