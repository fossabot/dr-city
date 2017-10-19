import { getRender } from './__utils__'

export const renderStaticFileList = getRender({
  title: 'File',
  packStyleList: [],
  packScriptList: [ 'dll-vendor.js', 'dll-vendor-firebase.js', 'runtime.js', 'file.js' ]
})
