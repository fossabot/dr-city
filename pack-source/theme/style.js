import { color } from './color'
import { metrics } from './metrics'

const LogStyle = {
  overflow: 'auto',
  padding: metrics.lengthM,
  maxHeight: '360px',
  fontSize: metrics.fontM,
  background: color.secondary100
}

const MarginXS = {
  margin: metrics.lengthXS
}

const ButtonIconLeftStyle = {
  marginRight: metrics.lengthXS
}

export { LogStyle, MarginXS, ButtonIconLeftStyle }
