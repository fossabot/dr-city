const nodeModulePath = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { PATH_RESOURCE_PACK, PATH_RESOURCE_PACK_DLL_MANIFEST, DLL_NAME_MAP } = require('./config')
const { HashedModuleIdsPlugin, DefinePlugin, BannerPlugin, DllReferencePlugin, optimize: { CommonsChunkPlugin, ModuleConcatenationPlugin } } = webpack

const NODE_ENV = process.env.NODE_ENV
const IS_PRODUCTION = NODE_ENV === 'production'

const OPTIONS = {
  BABEL_LOADER: {
    babelrc: false,
    presets: [ [ 'env', { targets: IS_PRODUCTION ? '>= 5%' : { node: 9 }, modules: false } ], 'react' ],
    plugins: [ 'transform-class-properties', [ 'transform-object-rest-spread', { useBuiltIns: true } ] ]
  }
}

const addEntryPolyfill = (entry) => Object.entries(entry).reduce((o, [ key, value ]) => {
  o[ key ] = [ 'babel-polyfill', value ]
  return o
}, {})

module.exports = {
  entry: addEntryPolyfill({
    'main': 'pack-source/index'
  }),
  output: {
    path: PATH_RESOURCE_PACK,
    filename: IS_PRODUCTION ? '[name]-[chunkhash:8].js' : '[name].js'
  },
  resolve: {
    alias: {
      'pack-source': nodeModulePath.resolve(__dirname, 'pack-source'),
      'config.pack': nodeModulePath.resolve(__dirname, 'config.pack')
    }
  },
  module: { rules: [ { test: /\.js$/, exclude: /node_modules/, use: [ { loader: 'babel-loader', options: OPTIONS.BABEL_LOADER } ] } ] },
  plugins: [
    new ExtractTextPlugin(IS_PRODUCTION ? '[name]-[contenthash:8].css' : '[name].css'),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !IS_PRODUCTION
    }),
    new HashedModuleIdsPlugin(),
    new CommonsChunkPlugin({ name: 'runtime' }),
    new DllReferencePlugin({ context: '.', manifest: require(nodeModulePath.resolve(PATH_RESOURCE_PACK_DLL_MANIFEST, `${DLL_NAME_MAP.VENDOR}.json`)) }),
    new DllReferencePlugin({ context: '.', manifest: require(nodeModulePath.resolve(PATH_RESOURCE_PACK_DLL_MANIFEST, `${DLL_NAME_MAP.VENDOR_FIREBASE}.json`)) }),
    new ManifestPlugin({ fileName: 'manifest/main.json' }),
    ...(IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new BabelMinifyPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
      new BannerPlugin({ banner: '/* stylelint-disable */', raw: true, test: /\.css$/, entryOnly: false }),
      new CompressionPlugin({ test: /\.(js|css)$/, minRatio: 1, deleteOriginalAssets: IS_PRODUCTION })
    ] : [])
  ]
}
