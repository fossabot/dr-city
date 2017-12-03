import { parseOption, exitWithError } from './option'
import { configureServer } from './server'
import { configureProcess } from './process'

const main = async () => {
  const { optionMap, getSingleOption, getSingleOptionOptional } = await parseOption()
  try {
    const { logger } = await configureProcess({
      filePid: getSingleOptionOptional(optionMap, 'file-pid'),
      pathLog: getSingleOptionOptional(optionMap, 'path-log'),
      logFilePrefix: getSingleOptionOptional(optionMap, 'prefix-log-file')
    })

    const protocol = getSingleOption(optionMap, 'protocol')

    await configureServer({
      protocol,
      hostname: getSingleOption(optionMap, 'hostname'),
      port: getSingleOption(optionMap, 'port'),
      ...(protocol === 'https:' ? {
        fileSSLKey: getSingleOption(optionMap, 'file-SSL-key'),
        fileSSLCert: getSingleOption(optionMap, 'file-SSL-cert'),
        fileSSLChain: getSingleOption(optionMap, 'file-SSL-chain'),
        fileSSLDHParam: getSingleOption(optionMap, 'file-SSL-dhparam')
      } : {}),
      pathShare: getSingleOption(optionMap, 'path-share'),
      pathUser: getSingleOption(optionMap, 'path-user'),
      fileFirebaseAdminToken: getSingleOption(optionMap, 'file-firebase-admin-token')
    }, {
      logger
    })
  } catch (error) {
    console.warn(error)
    process.exit(2)
  }
}

main().catch(exitWithError)
