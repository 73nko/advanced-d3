var path = require('path')
var webpack = require('webpack')
var express = require('express')
var config = require('./webpack.config')

var app = express()
var compiler = webpack(config)

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('/favicon.ico', function(req, res) {
  res.sendFile(path.join(__dirname, 'favicon.ico'))
})
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(8090, function(err) {
  if (err) {
    return console.error(err)
  }

  console.log('Listening at http://localhost:8090/')
})