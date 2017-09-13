import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderAuth = (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  <title>Auth</title>
</head>
<body style="width: 100%; height: 100%; overflow: auto;">
<button id="button-auth-primary"></button>
<button id="button-auth-secondary"></button>
<br />
<img id="image-user" src="" style="max-width: 48px; max-height: 48px; border-radius: 100%;" />
<br />
<p id="status-auth">...</p>
<br />
<button id="button-auth-check">Auth Check</button>
<br />
<pre id="status-auth-check"></pre>
${data.getPackScript('runtime.js')}
${data.getPackScript('vendor.js')}
${data.getPackScript('auth.js')}
</body>
</html>`
