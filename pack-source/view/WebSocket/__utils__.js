import { Browser, Common } from 'dr-js/module/Dr.browser'

const { Format } = Common
const { packBlobPacket, parseBlobPacket } = Browser.Blob

const addLogListener = (socket, log) => {
  socket.addEventListener('error', (event) => {
    log(`[error] ${JSON.stringify({ ...event })}`)
  })
  socket.addEventListener('open', ({ timestamp, isTrusted }) => {
    log(`[open] ${JSON.stringify({ timestamp, isTrusted })}`)
  })
  socket.addEventListener('close', ({ timestamp, isTrusted, code, reason, wasClean }) => {
    log(`[close] ${JSON.stringify({ timestamp, isTrusted, code, reason, wasClean })}`)
  })
  socket.addEventListener('message', async ({ timestamp, isTrusted, data, origin }) => {
    log(`[!|${formatDataSize(data)}] ${JSON.stringify({ timestamp, isTrusted, origin })}`)
    if (typeof (data) === 'string') {
      log(`  # ${truncate(data)}`)
    } else {
      const [ headerString, payloadBlob ] = await parseBlobPacket(data)
      log(`  # header: ${formatDataSize(headerString)} ${truncate(headerString)}`)
      log(`  # payload: ${formatDataSize(payloadBlob)}`)
    }
  })
}

const truncate = (string) => string.length > 64 ? `${string.slice(0, 56)}...` : string

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
  truncate,
  formatDataSize,
  createBufferPacket
}
