import { writeFileSync, unlinkSync } from 'fs'
import { setProcessExitListener } from 'dr-js/module/node/system'
import { createDirectory } from 'dr-js/module/node/file/File'
import { createLogger } from 'dr-js/module/node/module/Logger'

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

const prefixLoggerTime = (logger) => {
  const { add } = logger
  return { ...logger, add: (...args) => add(new Date().toISOString(), ...args) }
}

const configureProcess = async ({ pathLog, logFilePrefix, filePid }) => {
  const logger = prefixLoggerTime(await configureLogger({ pathLogDirectory: pathLog, prefixLogFile: logFilePrefix }))

  filePid && writeFileSync(filePid, `${process.pid}`)

  setProcessExitListener({
    listenerAsync: async ({ eventType, ...exitState }) => {
      __DEV__ && console.log('listenerAsync', eventType, exitState)
      logger.add(`[SERVER DOWN] eventType: ${eventType}, exitState: ${JSON.stringify(exitState)}`)
    },
    listenerSync: ({ eventType, code }) => {
      __DEV__ && console.log('listenerSync', eventType, code)
      logger.add(`[SERVER EXIT] eventType: ${eventType}, code: ${code}`)
      logger.end()
      try { filePid && unlinkSync(filePid) } catch (error) { __DEV__ && console.log('remove pid file', error) }
    }
  })

  return { logger }
}

export { configureProcess }
