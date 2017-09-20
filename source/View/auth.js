import { getRender } from './__utils__'

export const renderAuth = getRender({
  title: 'Auth',
  packScriptList: [ 'dll-vendor.js', 'dll-vendor-firebase.js', 'runtime.js', 'auth.js' ],
  packStyleList: [ 'runtime.css' ]
})
