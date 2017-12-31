const nodeModulePath = require('path')
const nodeModuleFs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(nodeModuleFs.readFile)
const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  ROUTE_MAP
} = require('./config.pack')

// webpack
const DLL_NAME_MAP = {
  VENDOR: 'dll-vendor',
  VENDOR_FIREBASE: 'dll-vendor-firebase'
}
const PATH_RESOURCE = nodeModulePath.resolve(__dirname, 'resource')
const PATH_RESOURCE_PACK = nodeModulePath.resolve(__dirname, 'resource/pack')
const PATH_RESOURCE_PACK_MANIFEST = nodeModulePath.resolve(__dirname, 'resource/pack/manifest')
const PATH_RESOURCE_PACK_DLL_MANIFEST = nodeModulePath.resolve(__dirname, 'resource/pack/dll-manifest-gitignore')
const GET_PACK_MANIFEST_MAP = async () => ({
  ...JSON.parse(await readFileAsync(nodeModulePath.join(PATH_RESOURCE_PACK_MANIFEST, 'main.json'))),
  ...JSON.parse(await readFileAsync(nodeModulePath.join(PATH_RESOURCE_PACK_MANIFEST, 'dll-vendor.json'))),
  ...JSON.parse(await readFileAsync(nodeModulePath.join(PATH_RESOURCE_PACK_MANIFEST, 'dll-vendor-firebase.json')))
})

module.exports = {
  DLL_NAME_MAP,
  PATH_RESOURCE,
  PATH_RESOURCE_PACK,
  PATH_RESOURCE_PACK_MANIFEST,
  PATH_RESOURCE_PACK_DLL_MANIFEST,
  GET_PACK_MANIFEST_MAP,

  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,

  ROUTE_MAP
}
