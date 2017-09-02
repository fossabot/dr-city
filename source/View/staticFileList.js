import nodeModulePath from 'path'
import { Common } from 'dr-js/library/Dr.node'
import { getStaticFileList } from '../Task/getStaticFileList'
import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

const { escapeHTML } = Common.Format

const render = (staticFileLinkList) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT}
  ${STYLE_RESET}
  <style>
    #root { width: 100%; height: 100%; overflow: auto; }
    .static { width: 100%; overflow: auto; display: flex; flex-flow: column; }
    .static-title { background: #eee; }
    .static-link { display: flex; flex-flow: row; align-items: center; margin: 2px 4px 0; font-size: 12px; }
    .static-extension { display: inline-block; overflow: hidden; margin-right: 2px; flex: 0 0 16px; width: 16px; height: 16px; font-size: 8px; line-height: 8px; word-break: break-all; color: #000; }
  </style>
  <title>Static file list</title>
</head>
<body>
<div id="root">
  <div class="static">
    <b class="static-title">[STATIC FILE LIST]</b>
    ${staticFileLinkList || ''}
  </div>
</div>
</body>
</html>`

const textToHSL = (text, hue = 0) => {
  for (let index = 0, indexMax = text.length; index < indexMax; index++) hue += Math.pow(text.charCodeAt(index), 4)
  return `hsl(${hue % 360}, 100%, 80%)`
}
const renderExtensionTag = (extension) => `<b class="static-extension" style="background: ${textToHSL(extension)}">${escapeHTML(extension.toUpperCase() || '?')}</b>`
const extensionTagMap = {}
const getExtensionTag = (relativeFilePath) => {
  const extension = nodeModulePath.extname(relativeFilePath)
  if (extensionTagMap[ extension ] === undefined) extensionTagMap[ extension ] = renderExtensionTag(extension.slice(1))
  return extensionTagMap[ extension ]
}
const renderStaticFileLink = (relativeFilePath, routePrefix) => `<p class="static-link">${getExtensionTag(relativeFilePath)}<a href="${routePrefix}/${relativeFilePath}">${escapeHTML(relativeFilePath)}</a></p>`

export const renderStaticFileList = async (staticRoot, routePrefix) => {
  const relativeFilePathList = await getStaticFileList(staticRoot)
  const staticFileLinkList = relativeFilePathList.map((relativeFilePath) => renderStaticFileLink(relativeFilePath, routePrefix)).join('\n')
  return render(staticFileLinkList)
}
