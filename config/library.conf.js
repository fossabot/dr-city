const nodeModulePath = require('path')
const config = require('./common.conf')

module.exports = Object.assign(config, {
  entry: { 'index': './source/index' },
  output: {
    path: nodeModulePath.join(__dirname, '../library/'),
    filename: '[name].js'
  }
})
