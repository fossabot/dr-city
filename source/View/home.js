import { getRender } from './__utils__'

export const renderHome = getRender({
  title: 'Dr.City',
  packStyleList: [],
  packScriptList: [ 'dll-vendor.js', 'dll-vendor-firebase.js', 'runtime.js', 'home.js' ]
})
