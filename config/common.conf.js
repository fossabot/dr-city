const nodeModulePath = require('path')
const webpack = require('webpack')
const { DefinePlugin, BannerPlugin, optimize: { ModuleConcatenationPlugin } } = webpack

const NODE_ENV = process.env.NODE_ENV
const PRODUCTION = NODE_ENV === 'production'

const BABEL_OPTIONS = {
  babelrc: false,
  presets: [ [ 'env', { targets: { node: 8 }, modules: false } ] ],
  plugins: [ 'transform-object-rest-spread', 'transform-class-properties' ]
}

module.exports = {
  // entry: {},
  target: 'node', // support node main modules like 'fs'
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: BABEL_OPTIONS }
      }
    ]
  },
  resolve: {
    alias: { source: nodeModulePath.resolve(__dirname, '../source') }
  },
  plugins: [].concat(
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !PRODUCTION
    }),
    PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false })
    ] : []
  )
}
