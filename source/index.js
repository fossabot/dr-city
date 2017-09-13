import nodeModulePath from 'path'
import nodeModuleFs from 'fs'
import { promisify } from 'util'
import { configureServer } from './server'
import { configureServerCertBot } from './serverCertbot'
import { parseCLI, parseENV, parseJSON, processOptionMap, exitWithError } from './option'

const readFileAsync = promisify(nodeModuleFs.readFile)

const main = async () => {
  let optionMap = parseCLI(process.argv)
  const getOption = (name) => optionMap[ name ] && optionMap[ name ].argumentList[ 0 ]

  const config = getOption('config')
  let pathRelative
  if (!config) {
    __DEV__ && console.log('all cli')
    pathRelative = process.cwd() // relative to the path cwd
  } else if (config.toLowerCase() === 'env') {
    __DEV__ && console.log('merge env')
    optionMap = { ...parseENV(process.env), ...optionMap }
    pathRelative = process.cwd() // relative to the path cwd
  } else {
    __DEV__ && console.log('merge json', config)
    optionMap = { ...parseJSON(JSON.parse(await readFileAsync(config, 'utf8'))), ...optionMap }
    pathRelative = nodeModulePath.dirname(config) // relative to packager-config.json
  }

  const mode = getOption('mode')
  const protocol = getOption('type')

  __DEV__ && Object.keys(optionMap).forEach((name) => console.log(`[${name}] ${getOption(name)}`))
  optionMap = processOptionMap(optionMap)
  __DEV__ && console.log('processOptionMap PASS')

  if (mode === 'server') {
    const { start } = await configureServer({
      protocol,
      hostName: getOption('host-name'),
      port: getOption('port'),
      ...(protocol === 'HTTPS' ? {
        fileSSLKey: getOption('file-SSL-key'),
        fileSSLCert: getOption('file-SSL-cert'),
        fileSSLChain: getOption('file-SSL-chain'),
        fileSSLDHParam: getOption('file-SSL-dhparam')
      } : {}),
      filePackManifest: getOption('file-pack-manifest'),
      fileFirebaseAdminToken: getOption('file-firebase-admin-token'),
      pathResource: nodeModulePath.resolve(pathRelative, getOption('path-resource')),
      pathLog: nodeModulePath.resolve(pathRelative, getOption('path-log')),
      logFilePrefix: getOption('prefix-log-file')
    })
    return start()
  }

  if (mode === 'certbot') {
    const { start } = await configureServerCertBot({
      hostName: getOption('host-name'),
      pathResource: nodeModulePath.resolve(pathRelative, getOption('path-resource'))
    })
    return start()
  }

  throw new Error(`[main] error mode: ${mode}`)
}

main().catch(exitWithError)
