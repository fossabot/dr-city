const DOCTYPE_HTML = '<!DOCTYPE html>'

const COMMON_HEAD_CONTENT = `<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=5, minimum-scale=1, width=device-width, height=device-height">
<meta name="theme-color" content="#63aeff">
<link href="/static/favicon.ico" rel="shortcut icon">`

const STYLE_RESET = `<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; font-family: monospace; font-size: 16px; }
button { font: inherit; }
textarea { outline: none; resize: none; background: transparent; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); border-radius: 3px; }
::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-track-piece, ::-webkit-scrollbar-corner, ::-webkit-resizer { background: transparent; }
</style>`

export {
  DOCTYPE_HTML,
  COMMON_HEAD_CONTENT,
  STYLE_RESET
}
