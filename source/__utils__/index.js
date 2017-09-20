export { createStatisticLogger } from './saveStatistics'

const wrapSetHSTS = (next) => (store) => {
  store.response.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload')
  return next(store)
}

const wrapSetCacheControl = (next) => (store) => {
  store.response.setHeader('cache-control', __DEV__ ? 'no-cache' : 'public, max-age=2592000') // in seconds, 30days = 2592000 = 30 * 24 * 60 * 60
  return next(store)
}

export { wrapSetHSTS, wrapSetCacheControl }
