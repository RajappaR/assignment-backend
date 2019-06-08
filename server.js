require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const routerImporter = require("./api/routeImports");
mongoose.Promise = global.Promise;
var config = null;

// UAT
// console.log(process.env);
// const dbUrl = process.env.dbUri;//'mongodb://cqworkdbadmin:asdfwerd21F@68.183.89.229:27017/cqworkflow'
var dbUrl = "";
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev';
console.log('Env ======> ' + process.env.NODE_ENV);
if(process.env.NODE_ENV=='dev'){
  config = require('./config/env/dev');
}else if(process.env.NODE_ENV=='prod'){
  config = require('./config/env/prod');
}

module.exports = config;

mongoose.connect(config.dbUri, {useNewUrlParser: true})
  .then(() => console.log('connection successful\nDB-URL: ' + config.dbUri))
  .catch((err) => console.error(err));
mongoose.set('debug', true);

/**bootstrap Mongoose models*/
fs.readdirSync(__dirname + '/models').forEach((file) => {
  if (~file.indexOf('.js')) {
    require(__dirname + '/models/' + file);
  }
});

require('./config/passport');
app.use(morgan('combined'));
app.use(cors());

app.use(bodyParser.json());

app.use("/api", routerImporter(router));
app.use(require('./auth'));
app.use("/statics", express.static(__dirname + "/storage"));

app.listen(3000, '0.0.0.0', () => {
  console.log("listening on Port:3000");
});
