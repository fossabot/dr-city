const nodeModulePath = require('path')
const { getConfig } = require('./dll.conf')
module.exports = getConfig({ pathOutput: nodeModulePath.resolve(__dirname, '../../example/resource/pack') })
