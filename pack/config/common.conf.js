const nodeModulePath = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const { DLL_NAME_MAP } = require('./dll.conf')
const { HashedModuleIdsPlugin, DefinePlugin, BannerPlugin, DllReferencePlugin, optimize: { CommonsChunkPlugin, ModuleConcatenationPlugin } } = webpack

const NODE_ENV = process.env.NODE_ENV
const IS_PRODUCTION = NODE_ENV === 'production'

const OPTIONS = {
  BABEL_LOADER: {
    babelrc: false,
    presets: [ [ 'env', { targets: IS_PRODUCTION ? '>= 5%' : { browser: 'last 2 Chrome versions' }, modules: false } ], 'react' ],
    plugins: [ 'transform-class-properties', [ 'transform-object-rest-spread', { useBuiltIns: true } ] ]
  },
  CSS_LOADER: { localIdentName: IS_PRODUCTION ? '[hash:base64:12]' : '[name]_[local]_[hash:base64:5]' }
}

const getConfig = ({ pathOutput }) => ({
  entry: {
    'home': 'view/home',
    'status': 'view/status',
    'file': 'view/file',
    'auth': 'view/auth',
    'websocket': 'view/websocket'
  },
  output: {
    path: pathOutput,
    filename: IS_PRODUCTION ? '[name]-[chunkhash:8].js' : '[name].js'
  },
  resolve: {
    alias: {
      view: nodeModulePath.resolve(__dirname, '../view'),
      theme: nodeModulePath.resolve(__dirname, '../theme'),
      option: nodeModulePath.resolve(__dirname, '../option')
    }
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: [ { loader: 'babel-loader', options: OPTIONS.BABEL_LOADER } ] }
    ]
  },
  plugins: [
    new ExtractTextPlugin(IS_PRODUCTION ? '[name]-[contenthash:8].css' : '[name].css'),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !IS_PRODUCTION
    }),
    new HashedModuleIdsPlugin(),
    new DllReferencePlugin({ context: '.', manifest: require(nodeModulePath.resolve(pathOutput, `dll-manifest/${DLL_NAME_MAP.VENDOR}.json`)) }),
    new DllReferencePlugin({ context: '.', manifest: require(nodeModulePath.resolve(pathOutput, `dll-manifest/${DLL_NAME_MAP.VENDOR_FIREBASE}.json`)) }),
    new CommonsChunkPlugin({ name: 'runtime' }),
    new ManifestPlugin({ fileName: 'manifest/common.json' }),
    ...(IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new MinifyPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
      new BannerPlugin({ banner: '/* stylelint-disable */', raw: true, test: /\.css$/, entryOnly: false }),
      new CompressionPlugin({ minRatio: 1 })
    ] : [])
  ]
})

module.exports = { getConfig }
