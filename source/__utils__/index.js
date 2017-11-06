import { Node } from 'dr-js/module/Dr.node'

const { File: { createDirectory }, Module: { createLogger } } = Node

const DEFAULT_LOG_LENGTH_THRESHOLD = __DEV__ ? 10 : 1024
const FILE_SPLIT_INTERVAL = __DEV__ ? 60 * 1000 : 24 * 60 * 60 * 1000 // 24hour, 1min in debug
const EMPTY_FUNC = () => {}
const createServerLogger = async ({
  pathLogDirectory,
  prefixLogFile = '',
  queueLengthThreshold = DEFAULT_LOG_LENGTH_THRESHOLD,
  fileSplitInterval = FILE_SPLIT_INTERVAL
}) => {
  __DEV__ && !pathLogDirectory && console.log('[Logger] output to console.log')
  if (!pathLogDirectory) return { add: console.log, save: EMPTY_FUNC, split: EMPTY_FUNC, end: EMPTY_FUNC }
  await createDirectory(pathLogDirectory)
  return createLogger({ pathLogDirectory, prefixLogFile, queueLengthThreshold, fileSplitInterval })
}

const wrapSetHSTS = (next) => (store) => {
  store.response.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload')
  return next(store)
}

const wrapSetCacheControl = (next) => (store) => {
  store.response.setHeader('cache-control', __DEV__ ? 'no-cache' : 'public, max-age=2592000') // in seconds, 30days = 2592000 = 30 * 24 * 60 * 60
  return next(store)
}

export { createServerLogger, wrapSetHSTS, wrapSetCacheControl }
