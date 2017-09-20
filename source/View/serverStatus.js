import { getRender } from './__utils__'

export const renderServerStatus = getRender({
  title: 'Status',
  packScriptList: [ 'dll-vendor.js', 'dll-vendor-firebase.js', 'runtime.js', 'status.js' ],
  packStyleList: [ 'runtime.css' ]
})
