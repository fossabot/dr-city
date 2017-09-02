import { Common } from 'dr-js/library/Dr.node'
import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

const { escapeHTML } = Common.Format

export const renderHome = (route, viewKeyList) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT}
  ${STYLE_RESET}
  <style>#root { width: 100%; height: 100%; overflow: auto; }</style>
  <title>Dr.City</title>
</head>
<body>
<div id="root">
  <p>Server is Online, good news!</p>
  ${viewKeyList.map((viewKey) => `<p><a href="${route}/${viewKey}">${escapeHTML(viewKey)}</a></p>`).join('\n')}
</div>
</body>
</html>`
