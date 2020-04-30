var path = require('path')
var webpack = require('webpack')

module.exports = {
  mode: "development",
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/entry'
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {test: /\js(x)?$/, loader: "babel-loader", query: {presets: ["@babel/react"]}},
      {test: /\.css$/, use: ["style-loader", "css-loader"]},
      {test: /\.(eot|woff|woff2)$/, loader: "file-loader"},
    ]
  }
}