const DOCTYPE_HTML = '<!DOCTYPE html>'

const COMMON_HEAD_CONTENT = ({ getResource }) => `<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=5, minimum-scale=1, width=device-width">
<meta name="theme-color" content="#63aeff">
<link rel="manifest" href="${getResource('manifest.json')}">
<link rel="shortcut icon" href="${getResource('favicon.ico')}">
${__DEV__ ? '' : `<link rel="preload" href="${getResource('material/Material-Icons.woff2')}" as="font" type="font/woff2">
<link rel="preload" href="${getResource('material/Roboto-Regular.woff2')}" as="font" type="font/woff2">
<link rel="preload" href="${getResource('material/Roboto-Medium.woff2')}" as="font" type="font/woff2">`}`

const STYLE_RESET = () => `<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  button { font: inherit; }
  textarea { outline: none; resize: none; background: transparent; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); }
  ::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-track-piece, ::-webkit-scrollbar-corner, ::-webkit-resizer { background: transparent; }
</style>`

const getRender = ({ title, packScriptList, packStyleList }) => (data) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  <link rel="stylesheet" href="${data.getResource('material/index.css')}" />
  ${packStyleList.map((packStyle) => `<link rel="stylesheet" href="${data.getPack(packStyle)}" />`).join('\n')}
  <title>${title}</title>
</head>
<body>
${packScriptList.map((packScript) => `<script src="${data.getPack(packScript)}"></script>`).join('\n')}
<div id="root" style="width: 100%; min-height: 100vh; overflow: auto; font-family: monospace; font-size: 16px; background: #f5f5f5;">This should be replaced with React soon...</div>
<script>window.main(document.getElementById('root'))</script>
</body>
</html>`

export {
  DOCTYPE_HTML,
  COMMON_HEAD_CONTENT,
  STYLE_RESET,
  getRender
}
