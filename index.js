var express = require('express')
var app = express()
var http = require('http')

const APP_PORT = 3000;

http.createServer(app).listen(APP_PORT, () => {
    console.log('Listening on port: ', APP_PORT)
});
