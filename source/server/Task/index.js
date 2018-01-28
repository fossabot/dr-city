import nodeModulePath from 'path'
import { binary as formatBinary } from 'dr-js/module/common/format'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { receiveBufferAsync } from 'dr-js/module/node/resource'
import { getEntityTagByContentHash } from 'dr-js/module/node/module/EntityTag'
import { createResponderBufferCache, responderSendJSON } from 'dr-js/module/node/server/Responder'

import { ROUTE_MAP } from 'config'

import { getServerStatus } from './getServerStatus'
import { getStaticFileList } from './getStaticFileList'
export { saveBufferToFile } from './saveBufferToFile'

const CACHE_EXPIRE_TIME = __DEV__ ? 0 : 60 * 1000 // in msec, 1min

const createResponderTask = ({ pathShare, routeShare, serveCacheMap }) => {
  const taskMap = new Map()
  taskMap.set(ROUTE_MAP.TASK_SERVER_STATUS, { asyncTask: getServerStatus, needPostBody: false })
  taskMap.set(ROUTE_MAP.TASK_FILE_LIST_SHARE, { asyncTask: (postBody) => getStaticFileList(pathShare, routeShare, postBody), needPostBody: true })

  // for public, use cache to rate-limit
  const responderBufferCache = createResponderBufferCache({
    getBufferData: async (store, bufferCacheKey) => {
      __DEV__ && console.log(`[Task] task ${bufferCacheKey}`)
      const { taskKey, postBody } = JSON.parse(bufferCacheKey)
      const { asyncTask } = taskMap.get(taskKey)
      const buffer = Buffer.from(JSON.stringify(await asyncTask(postBody)))

      __DEV__ && console.log(`[Task] task completed ${taskKey} ${formatBinary(buffer.length)}B`)
      return { buffer, length: buffer.length, type: BASIC_EXTENSION_MAP.json, entityTag: getEntityTagByContentHash(buffer) }
    },
    expireTime: CACHE_EXPIRE_TIME,
    serveCacheMap
  })

  return async (store, taskKey) => {
    if (!taskMap.has(taskKey)) throw new Error(`[Task] error taskKey: ${taskKey}`)

    const postBody = taskMap.get(taskKey).needPostBody
      ? JSON.parse((await receiveBufferAsync(store.request)).toString())
      : null

    const bufferCacheKey = JSON.stringify({ taskKey, postBody })

    __DEV__ && console.log(`[Task] getKey ${taskKey} | bufferCacheKey: ${bufferCacheKey}`)
    return responderBufferCache(store, bufferCacheKey)
  }
}

const createResponderAuthTask = ({ pathUser, routeUser }) => {
  const authTaskMap = new Map()
  authTaskMap.set(ROUTE_MAP.AUTH_TASK_SERVER_STATUS, { asyncTask: getServerStatus, needPostBody: false })
  authTaskMap.set(ROUTE_MAP.AUTH_TASK_FILE_LIST_USER, { asyncTask: (postBody, user) => getStaticFileList(nodeModulePath.join(pathUser, user.id), routeUser, postBody), needPostBody: true })
  authTaskMap.set(ROUTE_MAP.AUTH_TASK_TOKEN_CHECK, { asyncTask: (postBody, user) => user, needPostBody: false })

  // per user, no cache
  return async (store, authTaskKey, user) => {
    if (!authTaskMap.has(authTaskKey)) throw new Error(`[AuthTask] error taskKey: ${authTaskKey}`)

    const postBody = authTaskMap.get(authTaskKey).needPostBody
      ? JSON.parse((await receiveBufferAsync(store.request)).toString())
      : null

    const { asyncTask } = authTaskMap.get(authTaskKey)

    return responderSendJSON(store, { object: await asyncTask(postBody, user) })
  }
}

export { createResponderTask, createResponderAuthTask }
