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
    .static-link { font-size: 12px; }
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

const renderStaticFileLink = (relativeFilePath, routePrefix) => relativeFilePath
  ? `<a class="static-link" href="${routePrefix}/${relativeFilePath}">${escapeHTML(relativeFilePath)}</a>`
  : ''

export const renderStaticFileList = async (staticRoot, routePrefix) => {
  const relativeFilePathList = await getStaticFileList(staticRoot)
  const staticFileLinkList = relativeFilePathList.map((relativeFilePath) => renderStaticFileLink(relativeFilePath, routePrefix)).join('\n')
  return render(staticFileLinkList)
}
