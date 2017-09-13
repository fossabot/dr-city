import { Common } from 'dr-js/library/Dr.node'
const { escapeHTML } = Common.Format

const DOCTYPE_HTML = '<!DOCTYPE html>'

const COMMON_HEAD_CONTENT = ({ getStatic }) => `<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=5, minimum-scale=1, width=device-width">
<meta name="theme-color" content="#63aeff">
<link href="${getStatic('favicon.ico')}" rel="shortcut icon">`

const STYLE_RESET = () => `<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; font-family: monospace; font-size: 16px; }
  button { font: inherit; }
  textarea { outline: none; resize: none; background: transparent; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); border-radius: 3px; }
  ::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-track-piece, ::-webkit-scrollbar-corner, ::-webkit-resizer { background: transparent; }
</style>`

const STYLE_TAG_LINK = () => `<style>
  .tag-tag { display: inline-block; overflow: hidden; margin-right: 2px; flex: 0 0 16px; width: 16px; height: 16px; font-size: 8px; line-height: 8px; word-break: break-all; color: #000; }
  .tag-link { display: flex; flex-flow: row; align-items: center; margin: 2px 4px 0; font-size: 12px; }
</style>`
const textToHue = (text) => {
  let hue = 0
  for (let index = 0, indexMax = text.length; index < indexMax; index++) hue += Math.pow(text.charCodeAt(index), 4)
  return hue % 360
}
const cachedTagMap = {}
const getTag = (tagText) => (cachedTagMap[ tagText ] || (cachedTagMap[ tagText ] = `<b class="tag-tag" style="background: hsl(${textToHue(tagText)}, 100%, 80%)">${escapeHTML(tagText)}</b>`))
const renderTagLink = (tagText, linkUri, linkText) => `<p class="tag-link">${getTag(tagText)}<a href="${linkUri}">${escapeHTML(linkText || linkUri)}</a></p>`

export {
  DOCTYPE_HTML,
  COMMON_HEAD_CONTENT,
  STYLE_RESET,
  STYLE_TAG_LINK,
  renderTagLink
}
