const nodeModulePath = require('path')
const config = require('./common.conf')

module.exports = {
  ...config,
  bail: true, // Don't attempt to continue if there are any errors.
  devtool: 'source-map',
  output: {
    path: nodeModulePath.join(__dirname, '../library/'),
    filename: '[name].js'
  }
}
