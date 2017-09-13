import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET, STYLE_TAG_LINK, renderTagLink } from './__utils__'

export const renderHome = (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  ${STYLE_TAG_LINK(data)}
  <title>Dr.City</title>
</head>
<body style="width: 100%; height: 100%; overflow: auto;">
${data.viewKeyList.map((viewKey) => renderTagLink(getTagText(viewKey), `${data.route}/${viewKey}`, viewKey)).join('\n')}
</body>
</html>`

const getTagText = (viewKey) => viewKey.split('-').reduce((o, v) => o + v[ 0 ], '').toUpperCase()
