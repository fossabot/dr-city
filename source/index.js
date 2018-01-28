import { compressPath } from 'dr-js/module/node/file/Compress'

import { PATH_RESOURCE } from 'config'

import { parseOption, exitWithError } from './option'
import { configureProcess } from './process'
import { configureServer } from './server'

const main = async () => {
  const { getOptionOptional, getSingleOption, getSingleOptionOptional } = await parseOption()
  try {
    !__DEV__ && await compressPath({ path: PATH_RESOURCE, deleteBloat: true })
    const protocol = getOptionOptional('https') ? 'https:' : 'http:'
    await configureServer({
      protocol,
      hostname: getSingleOption('hostname'),
      port: getSingleOption('port'),
      ...(protocol === 'https:' ? {
        fileSSLKey: getSingleOption('file-SSL-key'),
        fileSSLCert: getSingleOption('file-SSL-cert'),
        fileSSLChain: getSingleOption('file-SSL-chain'),
        fileSSLDHParam: getSingleOption('file-SSL-dhparam')
      } : {}),
      pathShare: getSingleOption('path-share'),
      pathUser: getSingleOption('path-user'),
      fileFirebaseAdminToken: getSingleOption('file-firebase-admin-token')
    }, await configureProcess({
      pathLog: getSingleOptionOptional('path-log'),
      logFilePrefix: getSingleOptionOptional('prefix-log-file'),
      filePid: getSingleOptionOptional('file-pid')
    }))
  } catch (error) {
    console.warn(error)
    process.exit(2)
  }
}

main().catch(exitWithError)
