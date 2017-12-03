import nodeModuleFs from 'fs'
import nodeModulePath from 'path'
import { promisify } from 'util'
import { Node } from 'dr-js/module/Dr.node'

const { File: { createDirectory } } = Node

const writeFileAsync = promisify(nodeModuleFs.writeFile)

// The resulting path is normalized and trailing slashes are removed unless the path is resolved to the root directory.
const saveBufferToFile = async (saveRoot, filePath, buffer) => {
  filePath = nodeModulePath.resolve(saveRoot, filePath)
  if (!filePath.includes(saveRoot)) throw new Error(`[saveBufferToFile] filePath out of saveRoot: ${saveRoot}`)
  await createDirectory(nodeModulePath.dirname(filePath))
  await writeFileAsync(filePath, buffer)
  return filePath
}

export { saveBufferToFile }
