import nodeModulePath from 'path'
import { Node } from 'dr-js/module/Dr.node'

const { getFileList } = Node.File

const getStaticFileList = async (staticRoot) => {
  // The resulting path is normalized and trailing slashes are removed unless the path is resolved to the root directory.
  staticRoot = nodeModulePath.resolve(staticRoot)
  const filePathList = await getFileList(staticRoot)
  const staticRootLength = staticRoot.length
  return staticRootLength >= 2
    ? filePathList.map((filePath) => filePath.slice(staticRootLength + 1))
    : filePathList
}

export {
  getStaticFileList
}
