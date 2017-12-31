const nodeModulePath = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const { PATH_RESOURCE_PACK, PATH_RESOURCE_PACK_DLL_MANIFEST, DLL_NAME_MAP } = require('./config')
const { HashedModuleIdsPlugin, DefinePlugin, BannerPlugin, DllPlugin, optimize: { ModuleConcatenationPlugin } } = webpack

const NODE_ENV = process.env.NODE_ENV
const IS_PRODUCTION = NODE_ENV === 'production'

const getDllConfig = (dllName, dllEntryChunks, isMinify) => {
  const libraryName = `__${dllName.replace(/[^\w]/g, '_').toUpperCase()}__`
  return {
    bail: IS_PRODUCTION, // Don't attempt to continue if there are any errors.
    devtool: false, // IS_PRODUCTION ? 'source-map' : false, // TODO: Wait for: https://github.com/webpack/webpack-sources/issues/28
    entry: { [ dllName ]: dllEntryChunks },
    output: {
      path: PATH_RESOURCE_PACK,
      filename: IS_PRODUCTION ? `[name]-[chunkhash:8].js` : `[name].js`,
      library: libraryName
    },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        '__DEV__': !IS_PRODUCTION
      }),
      new HashedModuleIdsPlugin(),
      new DllPlugin({ name: libraryName, path: nodeModulePath.resolve(PATH_RESOURCE_PACK_DLL_MANIFEST, `${dllName}.json`) }),
      new ManifestPlugin({ fileName: `manifest/${dllName}.json` }),
      ...(IS_PRODUCTION ? [
        new ModuleConcatenationPlugin(),
        ...(isMinify ? [ new BabelMinifyPlugin() ] : []), // TODO: minification error: https://github.com/firebase/firebase-js-sdk/issues/154
        new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
        new CompressionPlugin({ test: /\.js$/, minRatio: 1, deleteOriginalAssets: true })
      ] : [])
    ]
  }
}

module.exports = [
  getDllConfig(
    DLL_NAME_MAP.VENDOR,
    [
      'babel-polyfill',
      'dr-js/module/Dr.browser',
      'material-ui',
      'prop-types',
      'react',
      'react-dom',
      'react-redux'
    ],
    true
  ),
  getDllConfig(
    DLL_NAME_MAP.VENDOR_FIREBASE,
    [
      'firebase/app',
      'firebase/auth'
    ],
    false // TODO: minification error: https://github.com/firebase/firebase-js-sdk/issues/154
  )
]
