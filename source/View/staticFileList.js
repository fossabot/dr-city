import nodeModulePath from 'path'
import { getStaticFileList } from '../Task/getStaticFileList'
import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET, STYLE_TAG_LINK, renderTagLink } from './__utils__'

const render = (data, staticFileLinkList) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  ${STYLE_TAG_LINK(data)}
  <style>.static-title { background: #eee; }</style>
  <title>Static file list</title>
</head>
<body style="width: 100%; height: 100%; overflow: auto; display: flex; flex-flow: column;">
<b class="static-title">[STATIC FILE LIST]</b>
${staticFileLinkList || ''}
</body>
</html>`

export const renderStaticFileList = async (data) => {
  const { staticRoot, staticRoutePrefix } = data
  const relativeFilePathList = await getStaticFileList(staticRoot)
  return render(data, relativeFilePathList.map((relativeFilePath) => renderTagLink(
    nodeModulePath.extname(relativeFilePath).slice(1).toUpperCase(),
    `${staticRoutePrefix}/${relativeFilePath}`,
    relativeFilePath
  )).join('\n'))
}

