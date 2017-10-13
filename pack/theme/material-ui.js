import { createMuiTheme } from 'material-ui'
import { color } from './color'

const THEME_COLOR_KEY_LIST = [ '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700' ]
const getColorObject = (prefix) => THEME_COLOR_KEY_LIST.reduce((o, v) => {
  o[ v ] = color[ `${prefix}${v}` ]
  return o
}, {})

const MuiTheme = createMuiTheme({
  palette: {
    error: { ...getColorObject('error'), contrastDefaultColor: 'light' },
    primary: { ...getColorObject('primary'), contrastDefaultColor: 'dark' },
    secondary: { ...getColorObject('secondary'), contrastDefaultColor: 'dark' }
  }
})

export { MuiTheme }
