import { Common } from 'dr-js/library/Dr.node'
import { getServerStatus } from '../Task/getServerStatus'
import { DOCTYPE_HTML, COMMON_HEAD_CONTENT, STYLE_RESET } from './__utils__'

const { escapeHTML } = Common.Format

const render = (data, serverStatus) => `${DOCTYPE_HTML}
<html lang="en">
<head>
  ${COMMON_HEAD_CONTENT(data)}
  ${STYLE_RESET(data)}
  <style>
    .status-title { background: #eee; }
    .status-stdout { font-size: 12px; color: #666; overflow: auto; }
    .status-stderr { font-size: 12px; color: #f66; overflow: auto; }
  </style>
  <title>Server Status</title>
</head>
<body style="width: 100%; height: 100%; overflow: auto;">
<p class="status-title">
  <b>[PLATFORM]</b> ${escapeHTML(process.platform)}
  <b>[GENERATE TIME]</b> ${escapeHTML((new Date()).toISOString())}
</p>
${serverStatus || ''}
</body>
</html>`

const renderStatus = (config, status) => {
  if (!status) return `[ERROR][${config.name}] ${config.command}`
  const { code, signal, stdoutString, stderrString } = status
  return `<p class="status-title"><b>[${config.name}]</b> ${config.command}${code !== 0 ? ` <b>[${code}]</b> ${escapeHTML(signal) || ''}` : ''}</p>` +
    (stdoutString ? `<pre class="status-stdout">${escapeHTML(stdoutString)}</pre>` : '') +
    (stderrString ? `<pre class="status-stderr">${escapeHTML(stderrString)}</pre>` : '')
}

export const renderServerStatus = async (data) => {
  const serverStatusList = await getServerStatus()
  const serverStatus = serverStatusList.map(({ config, status }) => renderStatus(config, status)).join('\n')
  return render(data, serverStatus)
}
