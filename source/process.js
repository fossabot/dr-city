import nodeModuleFs from 'fs'
import { Node } from 'dr-js/module/Dr.node'

const { System: { setProcessExitListener }, File: { createDirectory }, Module: { createLogger } } = Node

const configureProcess = async ({ pathLog, logFilePrefix, filePid }) => {
  const logger = await configureLogger({ pathLogDirectory: pathLog, prefixLogFile: logFilePrefix })

  filePid && nodeModuleFs.writeFileSync(filePid, `${process.pid}`)

  setProcessExitListener({
    listenerAsync: async ({ eventType, ...exitState }) => {
      __DEV__ && console.log('listenerAsync', eventType, exitState)
      logger.add(`${new Date().toISOString()} [SERVER DOWN] eventType: ${eventType}, exitState: ${JSON.stringify(exitState)}`)
    },
    listenerSync: ({ eventType, code }) => {
      __DEV__ && console.log('listenerSync', eventType, code)
      logger.add(`${new Date().toISOString()} [SERVER EXIT] eventType: ${eventType}, code: ${code}`)
      logger.end()
      try { filePid && nodeModuleFs.unlinkSync(filePid) } catch (error) { __DEV__ && console.log('remove pid file', error) }
    }
  })

  return { logger }
}

const DEFAULT_LOG_LENGTH_THRESHOLD = __DEV__ ? 10 : 1024
const FILE_SPLIT_INTERVAL = __DEV__ ? 60 * 1000 : 24 * 60 * 60 * 1000 // 24hour, 1min in debug
const EMPTY_FUNC = () => {}
const configureLogger = async ({
  pathLogDirectory,
  prefixLogFile = '',
  queueLengthThreshold = DEFAULT_LOG_LENGTH_THRESHOLD,
  fileSplitInterval = FILE_SPLIT_INTERVAL
}) => {
  __DEV__ && !pathLogDirectory && console.log('[Logger] output with console.log()')
  if (!pathLogDirectory) return { add: console.log, save: EMPTY_FUNC, split: EMPTY_FUNC, end: EMPTY_FUNC }
  await createDirectory(pathLogDirectory)
  return createLogger({
    pathLogDirectory,
    queueLengthThreshold,
    fileSplitInterval,
    getLogFileName: () => `${prefixLogFile}${(new Date().toISOString()).replace(/\W/g, '-')}.log`,
    flags: 'a' // append if name clash
  })
}

export { configureProcess }
