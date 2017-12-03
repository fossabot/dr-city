import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderDefault = (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
${COMMON_HEAD_CONTENT(data)}
${STYLE_RESET(data)}
<title>Content not found</title>
</head>
<body>
<div id="root" style="width: 100%; min-height: 100vh; overflow: auto; font-family: monospace; font-size: 16px; background: #f5f5f5;">
<p>Content not found...</p>
<a href="/">HOME</a>
</div>
</body>
</html>`
