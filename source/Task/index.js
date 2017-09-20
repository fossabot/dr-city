import { Common, Node } from 'dr-js/module/Dr.node'
import { getServerStatus } from './getServerStatus'
import { getStaticFileList } from './getStaticFileList'

const { Format } = Common
const { getEntityTagByContentHash } = Node.Module
const { createResponderBufferCache } = Node.Server.Responder

const CACHE_EXPIRE_TIME = __DEV__ ? 0 : 60 * 1000 // in msec, 1min

const createResponderTask = ({ staticRoot, staticRoutePrefix, serveCacheMap }) => {
  const taskKeyMap = new Map()
  taskKeyMap.set('task:server-status', getServerStatus)
  taskKeyMap.set('task:static-file-list', getStaticFileList.bind(null, staticRoot, staticRoutePrefix))

  return createResponderBufferCache({
    getKey: (store) => {
      let { taskKey } = store.getState()
      if (!taskKeyMap.has(taskKey)) throw new Error(`[responderTask] error taskKey: ${taskKey}`)
      __DEV__ && console.log(`[responderTask] getKey ${taskKey}`)
      return taskKey
    },
    getBufferData: async (store, taskKey) => {
      __DEV__ && console.log(`[responderTask] task ${taskKey}`)
      const buffer = Buffer.from(JSON.stringify(await taskKeyMap.get(taskKey)()))
      __DEV__ && console.log(`[responderTask] task completed ${taskKey} ${Format.binary(buffer.length)}B`)
      return { buffer, length: buffer.length, type: 'text/plain', entityTag: getEntityTagByContentHash(buffer) }
    },
    expireTime: CACHE_EXPIRE_TIME,
    serveCacheMap
  })
}

export { createResponderTask }
