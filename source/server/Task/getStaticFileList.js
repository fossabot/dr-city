import nodeModulePath from 'path'
import { FILE_TYPE } from 'dr-js/module/node/file/File'
import { getDirectoryContent } from 'dr-js/module/node/file/Directory'

// single level
// relativePath should be under staticRoot
const getStaticFileList = async (staticRoot, routePrefix, postBody) => {
  __DEV__ && console.log('[getStaticFileList]', { staticRoot, routePrefix, postBody })
  const rootPath = pathRootCheck(staticRoot, postBody.relativePath)
  const relativePath = normalizePathSeparator(nodeModulePath.relative(staticRoot, rootPath)) // may be '' for root
  try {
    const content = await getDirectoryContent(rootPath, undefined, true) // single level deep
    return {
      routePrefix,
      relativePath,
      directoryList: Array.from(content[ FILE_TYPE.Directory ].keys()), // name only
      fileList: content[ FILE_TYPE.File ] // name only
    }
  } catch (error) {
    __DEV__ && console.warn('[getStaticFileList] error:', error)
    return { routePrefix, relativePath, directoryList: [], fileList: [] }
  }
}

const pathRootCheck = (rootPath, relativePath) => {
  const absolutePath = nodeModulePath.normalize(nodeModulePath.join(rootPath, relativePath))
  if (!absolutePath.startsWith(rootPath)) throw new Error(`[pathRootCheck] relativePath out of rootPath: ${relativePath}`)
  return absolutePath
}

const normalizePathSeparator = nodeModulePath.sep === '\\' ? (path) => path.replace(/\\/g, '/') : (path) => path

export { getStaticFileList }
