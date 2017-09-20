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
  BABEL_LOADER: IS_PRODUCTION
    ? { presets: [ [ 'es2015', { modules: false } ], 'stage-0', 'react' ] }
    : { presets: [ 'stage-0', 'react' ] },
  CSS_LOADER: IS_PRODUCTION
    ? { importLoaders: 1, localIdentName: '[hash:base64:12]' }
    : { importLoaders: 1, localIdentName: '[name]_[local]_[hash:base64:5]' },
  POSTCSS_LOADER: { plugins: () => [ require('postcss-cssnext') ] }
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
    rules: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [ { loader: 'babel-loader', options: OPTIONS.BABEL_LOADER } ]
    }, {
      test: /\.pcss$/,
      use: ExtractTextPlugin.extract({ use: [ { loader: 'css-loader', options: OPTIONS.CSS_LOADER }, { loader: 'postcss-loader', options: OPTIONS.POSTCSS_LOADER } ] })
    }, {
      exclude: [ /\.js$/, /\.pcss$/, /\.json$/ ],
      use: [ { loader: 'file-loader', options: { name: IS_PRODUCTION ? '../static/[name]-[hash].[ext]' : '../static/[name].[ext]' } } ]
    } ]
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
