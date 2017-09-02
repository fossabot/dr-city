import nodeModulePath from 'path'
import { Common, Node } from 'dr-js/library/Dr.node'

const { getRandomId } = Common.Math
const { File: { createDirectory }, Module: { createLogger } } = Node

const DEFAULT_LOG_LENGTH_THRESHOLD = __DEV__ ? 10 : 1024
const LOG_FILE_SPLIT_INTERVAL = __DEV__ ? 60 * 1000 : 24 * 60 * 60 * 1000 // 24hour, 1min in debug

const createStatisticLogger = async ({
  logRoot,
  logFilePrefix = '',
  logLengthThreshold = DEFAULT_LOG_LENGTH_THRESHOLD
}) => {
  await createDirectory(logRoot)

  const resetLogger = () => {
    logger && logger.end()
    logger = createLogger({ logFilePath: nodeModulePath.join(logRoot, `${logFilePrefix}${getRandomId()}.log`), logLengthThreshold })
  }
  let logger = null
  let token = setInterval(resetLogger, LOG_FILE_SPLIT_INTERVAL)
  resetLogger()

  return {
    logStatistic: (...args) => {
      __DEV__ && console.log(...args)
      logger && logger.log(...args)
    },
    endStatistic: () => {
      token && clearInterval(token)
      token = null
      logger && logger.end()
      logger = null
    }
  }
}

export { createStatisticLogger }
