import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderAuth = async () => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT}
  ${STYLE_RESET}
  <style>
    #root { width: 100%; height: 100%; overflow: auto; }
    #image-user { max-width: 48px; max-height: 48px; border-radius: 100%; }
  </style>
  <title>Auth</title>
</head>
<body>
<div id="root">
  <button id="button-auth-primary"></button>
  <button id="button-auth-secondary"></button>
  <br />
  <img id="image-user" src="" />
  <br />
  <p id="status-auth">...</p>
  <br />
  <button id="button-auth-check">Auth Check</button>
  <br />
  <pre id="status-auth-check"></pre>
</div>
</body>
<script src="/static/firebase-app.js"></script>
<script src="/static/firebase-auth.js"></script>
<script src="/static/auth.js"></script>
</html>`
