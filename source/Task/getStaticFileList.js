import nodeModulePath from 'path'
import { Node } from 'dr-js/module/Dr.node'

const { getFileList } = Node.File

const getStaticFileList = async (staticRoot, staticRoutePrefix) => {
  // The resulting path is normalized and trailing slashes are removed unless the path is resolved to the root directory.
  staticRoot = nodeModulePath.resolve(staticRoot)
  const filePathList = await getFileList(staticRoot)
  const relativeFilePathList = staticRoot.length >= 2
    ? filePathList.map((filePath) => filePath.slice(staticRoot.length + 1))
    : filePathList
  return { relativeFilePathList, staticRoutePrefix }
}

export { getStaticFileList }
