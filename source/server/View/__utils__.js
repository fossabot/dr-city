const DOCTYPE_HTML = '<!DOCTYPE html>'

const COMMON_HEAD_CONTENT = ({ getResource }) => `<meta charset="utf-8">
<meta name="viewport" content="minimum-scale=1, width=device-width">
<meta name="theme-color" content="#63aeff">
<link rel="manifest" href="${getResource('manifest.json')}">
<link rel="shortcut icon" href="${getResource('favicon.ico')}">`

const STYLE_RESET = () => `<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  button { font: inherit; }
  textarea { outline: none; resize: none; background: transparent; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); }
</style>`

const getRender = ({ title, packScriptList, packStyleList }) => (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
${COMMON_HEAD_CONTENT(data)}
${STYLE_RESET(data)}
<link rel="stylesheet" href="${data.getResource('font/index.css')}" />
${packStyleList.map((packStyle) => `<link rel="stylesheet" href="${data.getResourcePack(packStyle)}" />`).join('\n')}
<title>${title}</title>
</head>
<body>
${packScriptList.map((packScript) => `<script src="${data.getResourcePack(packScript)}"></script>`).join('\n')}
<div id="root" style="width: 100%; min-height: 100vh; overflow: auto; font-family: monospace; font-size: 16px; background: #f5f5f5;">Failed to load JavaScript UI...</div>
<script>Promise.resolve(window.main(document.getElementById('root'))).catch(console.warn)</script>
</body>
</html>`

export {
  DOCTYPE_HTML,
  COMMON_HEAD_CONTENT,
  STYLE_RESET,
  getRender
}
