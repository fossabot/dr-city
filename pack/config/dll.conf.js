const nodeModulePath = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const { HashedModuleIdsPlugin, DefinePlugin, BannerPlugin, DllPlugin, optimize: { ModuleConcatenationPlugin } } = webpack

const NODE_ENV = process.env.NODE_ENV
const IS_PRODUCTION = NODE_ENV === 'production'

const GET_CONFIG_DLL = (pathOutput, dllName, dllEntryChunks, isMinify) => {
  const libraryName = `__${dllName.replace(/[^\w]/g, '_').toUpperCase()}__`
  return {
    bail: IS_PRODUCTION, // Don't attempt to continue if there are any errors.
    devtool: IS_PRODUCTION ? 'source-map' : false,
    entry: { [dllName]: dllEntryChunks },
    output: {
      library: libraryName,
      filename: IS_PRODUCTION ? `[name]-[chunkhash:8].js` : `[name].js`,
      path: pathOutput
    },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        '__DEV__': !IS_PRODUCTION
      }),
      new HashedModuleIdsPlugin(),
      new DllPlugin({ name: libraryName, path: nodeModulePath.resolve(pathOutput, `dll-manifest/${dllName}.json`) }),
      new ManifestPlugin({ fileName: `manifest/${dllName}.json` }),
      ...(IS_PRODUCTION ? [
        new ModuleConcatenationPlugin(),
        ...(isMinify ? [ new MinifyPlugin() ] : []), // TODO: minification error: https://github.com/firebase/firebase-js-sdk/issues/154
        new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
        new CompressionPlugin({ minRatio: 1 })
      ] : [])
    ]
  }
}

const DLL_NAME_MAP = {
  VENDOR: 'dll-vendor',
  VENDOR_FIREBASE: 'dll-vendor-firebase'
}

const getConfig = ({ pathOutput }) => [
  GET_CONFIG_DLL(pathOutput, DLL_NAME_MAP.VENDOR, [ 'babel-polyfill', 'dr-js/module/Dr.browser', 'react', 'react-dom', 'prop-types', 'material-ui' ], true),
  GET_CONFIG_DLL(pathOutput, DLL_NAME_MAP.VENDOR_FIREBASE, [ 'firebase/app', 'firebase/auth' ], false) // TODO: minification error: https://github.com/firebase/firebase-js-sdk/issues/154
]

module.exports = { DLL_NAME_MAP, getConfig }
