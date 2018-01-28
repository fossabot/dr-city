import nodeModulePath from 'path'
import { writeFileAsync } from 'dr-js/module/node/file/__utils__'
import { createDirectory } from 'dr-js/module/node/file/File'

// The resulting path is normalized and trailing slashes are removed unless the path is resolved to the root directory.
const saveBufferToFile = async (saveRoot, filePath, buffer) => {
  filePath = nodeModulePath.resolve(saveRoot, filePath)
  if (!filePath.includes(saveRoot)) throw new Error(`[saveBufferToFile] filePath out of saveRoot: ${saveRoot}`)
  await createDirectory(nodeModulePath.dirname(filePath))
  await writeFileAsync(filePath, buffer)
  return filePath
}

export { saveBufferToFile }
