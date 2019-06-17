'use strict';

const Simulation = require("./simulation/temp_data_simulation.js");
const SetupDB = require('./simulation/setupDefaultDB.js');
const SelfCheck = require('./selfcheck/checkstatus.js');
var SwaggerExpress = require('swagger-express-mw');
require('dotenv').config();

var app = require('express')();
var mongoose = require("mongoose");

module.exports = app; // for testing

var swStats = require('swagger-stats');
app.use(swStats.getMiddleware({}));

mongoose.connect(
  process.env.DB_HOST,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () =>
  {
    console.log("connected to the database!!");
    SetupDB.checkDemoExist(function(exist) {
      if(exist) {
        console.log("hxmonitor db exists");
        //SetupDB.deleteDemoAccount();
      }
      else {
        console.log("hxmonitor db not exists, create demo account");
        SetupDB.createDemoAccount();
      }
    });
  });
// some changes
// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));



//SetupDB.createDemoAccount();
Simulation.simulate(60000);
//SelfCheck.selfcheck(60000);

var config = {
  appRoot: __dirname, // required config
  /*swaggerSecurityHandlers: {
    UserSecurity: function(req, authOrSecDef, scopesOrApiKey, callback) {
        var apikey = req.headers['x-api-key'];
        if (typeof(apikey) != "undefined")
        {
          userManage.authenticate(apikey,function(ret1, data){
            if (ret1)
            {
              return callback(null);
            }
            else {
              return callback(new Error('access denied'));
            }
          });

        }
        else {
          return callback(new Error('access denied'));
        }
    }
  }*/
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.APP_PORT;
  app.listen(port, function() {
      console.log('Backend started at ' + port);
  });

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    //console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
