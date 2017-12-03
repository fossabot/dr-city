import { Browser, Common } from 'dr-js/module/Dr.browser'

const { Format } = Common
const { packBlobPacket, parseBlobPacket } = Browser.Blob

const addLogListener = (socket, log) => {
  socket.addEventListener('error', (event) => {
    log(`[error] ${JSON.stringify({ ...event })}`)
  })
  socket.addEventListener('open', ({ type, timestamp, isTrusted }) => {
    log(`[open] ${JSON.stringify({ type, timestamp, isTrusted })}`)
  })
  socket.addEventListener('close', ({ type, timestamp, isTrusted, code, reason, wasClean }) => {
    log(`[close] ${JSON.stringify({ type, timestamp, isTrusted, code, reason, wasClean })}`)
  })
  socket.addEventListener('message', async ({ type, timestamp, isTrusted, data, origin }) => {
    log(`[<<|${formatDataSize(data)}] ${JSON.stringify({ type, timestamp, isTrusted, origin })}`)
    if (typeof (data) !== 'string') {
      const [ headerString, payloadBlob ] = await parseBlobPacket(data)
      log(`[<<|${formatDataSize(data)}|packet-decoded] headerString: ${formatDataSize(headerString)}, payloadBlob: ${formatDataSize(payloadBlob)}`)
    }
  })
}

const formatDataSize = (data) => `${Format.binary(!data ? 0 : typeof (data) === 'string' ? data.length : data.size)}B`

const createBufferPacket = (type, payload, payloadBlob) => {
  const headerString = JSON.stringify({ type, payload })
  return {
    headerString,
    payloadBlob,
    blobPacket: packBlobPacket(headerString, payloadBlob)
  }
}

export {
  addLogListener,
  formatDataSize,
  createBufferPacket
}
