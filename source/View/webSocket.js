import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

export const renderWebSocket = (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  <style>
    section { display: flex; flex-flow: column; padding: 2px 8px; }
    pre, input, textarea { display: block; box-shadow: inset 0 0 2px 0 #666; margin: 2px 0; }
  </style>
  <title>WebSocket</title>
</head>
<body style="width: 100%; height: 100%; overflow: auto; display: flex; flex-flow: row wrap;">
<section>
  <label>Test TextJSON</label>
  <div>
    <button id="button-text-json">...</button>
    <button id="button-text-json-send">send</button>
    <button id="button-text-json-clear-log">clear Log</button>
  </div>
  <input id="input-text-json" value="data-type" />
  <textarea id="textarea-text-json">data-payload</textarea>
  <pre id="log-text-json">LOG</pre>
</section>
<section>
  <label>Test BlobPacket</label>
  <div>
    <button id="button-buffer-packet">...</button>
    <button id="button-buffer-packet-send">send</button>
    <button id="button-buffer-packet-clear-log">clear Log</button>
  </div>
  <input id="input-buffer-packet" value="data-type" />
  <textarea id="textarea-buffer-packet">data-payload</textarea>
  <input id="input-buffer-packet-file" type="file" />
  <pre id="log-buffer-packet">LOG</pre>
</section>
${data.getPackScript('runtime.js')}
${data.getPackScript('vendor.js')}
${data.getPackScript('websocket.js')}
</body>
</html>`
