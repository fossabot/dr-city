import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderHome = async () => `${DOCTYPE_HTML}
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
</div>
</body>
</html>`
