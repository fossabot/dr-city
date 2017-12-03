import { getRender } from './__utils__'

export const renderMain = getRender({
  title: 'Main',
  packStyleList: [],
  packScriptList: [
    'dll-vendor.js',
    'dll-vendor-firebase.js',
    'runtime.js',
    'main.js'
  ]
})
