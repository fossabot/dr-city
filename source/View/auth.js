import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderAuth = (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  <link rel="stylesheet" href="${data.getStatic('material/index.css')}" />
  <link rel="stylesheet" href="${data.getPack('auth.css')}" />
  <title>Auth</title>
</head>
<body>
<div id="root" style="width: 100%; height: 100%; overflow: auto;">This should be replaced with React soon...</div>
<script src="${data.getPack('runtime.js')}"></script>
<script src="${data.getPack('vendor.js')}"></script>
<script src="${data.getPack('vendor-firebase.js')}"></script>
<script src="${data.getPack('auth.js')}"></script>
<script>window.main(document.getElementById('root'))</script>
</body>
</html>`
