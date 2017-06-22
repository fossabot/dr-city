import nodeModulePath from 'path'
import nodeModuleFs from 'fs'
import { Common } from 'dr-js/library/Dr.node'

const { getRandomId } = Common.Math

const DEFAULT_LOG_LENGTH_THRESHOLD = __DEV__ ? 10 : 1024
const DEFAULT_ON_ERROR = (error) => {
  console.warn(error)
  throw error
}

const createStatisticLogger = ({
  logRoot,
  logFilePrefix = '',
  logLengthThreshold = DEFAULT_LOG_LENGTH_THRESHOLD,
  onError = DEFAULT_ON_ERROR
}) => {
  if (!nodeModuleFs.existsSync(logRoot)) nodeModuleFs.mkdirSync(logRoot)
  else if (!nodeModuleFs.statSync(logRoot).isDirectory()) throw new Error(`[createStatisticLogger] non-directory at ${logRoot}`)

  const logFileName = `${logFilePrefix}${getRandomId()}.log`
  const logStream = nodeModuleFs.createWriteStream(nodeModulePath.join(logRoot, logFileName), { flags: 'a' })
  logStream.on('error', onError)

  let logQueue = []
  const writeSet = new Set()

  const log = (logString) => {
    logString = `[${(new Date()).toISOString()}] ${logString}`
    __DEV__ && console.log('[StatisticLogger] log', logString)
    logString && logQueue.push(logString)
    logQueue.length > logLengthThreshold && saveLog()
  }

  const saveLog = () => {
    if (logQueue.length === 0) return
    __DEV__ && console.log('[StatisticLogger] saveLog')
    const saveLogQueue = logQueue
    logQueue = []
    saveLogQueue.push('') // for an extra '\n'
    const writeString = saveLogQueue.join('\n')
    writeSet.add(writeString)
    logStream.write(writeString, () => {
      writeSet.delete(writeString)
      __DEV__ && console.log('[StatisticLogger] saveLog finished')
    })
  }

  const endSaveLog = () => {
    __DEV__ && console.log('[StatisticLogger] endSaveLog')

    logStream.end() // TODO: should flush

    if (logQueue.length !== 0) {
      const saveLogQueue = logQueue
      saveLogQueue.push('') // for an extra '\n'
      const writeString = saveLogQueue.join('\n')
      writeSet.add(writeString)
    }

    if (writeSet.size !== 0) nodeModuleFs.appendFileSync(nodeModulePath.join(logRoot, logFileName), Array.from(writeSet).join(''))
  }

  return {
    log,
    saveLog,
    endSaveLog
  }
}

export {
  createStatisticLogger
}
