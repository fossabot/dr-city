import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderDefault = (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  <title>Content not found</title>
</head>
<body style="width: 100%; height: 100%; overflow: auto;">
<p>Content not found...</p>
<a href="/">HOME</a>
</body>
</html>`
