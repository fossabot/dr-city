import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderDefault = async () => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT}
  ${STYLE_RESET}
  <style>#root { width: 100%; height: 100%; overflow: auto; }</style>
  <title>Content not found</title>
</head>
<body>
<div id="root">
  <p>Content not found...</p>
</div>
</body>
</html>`
