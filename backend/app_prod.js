'use strict';

const DBHOST = require('./config/constants.js').DBHOST;
const CLIENT_HOST = require('./config/constants.js').CLIENT_HOST;
const API_PORT =  require('./config/constants.js').API_PORT;
const Simulation = require("./simulation/temp_data_simulation.js");
const SetupDB = require('./simulation/setupDefaultDB.js');
const SelfCheck = require('./selfcheck/checkstatus.js');
var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var mongoose = require("mongoose");
const privateKey = fs.readFileSync('/etc/letsencrypt/live/hxmonitor.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/hxmonitor.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/hxmonitor.io/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

module.exports = app; // for testing

var swStats = require('swagger-stats');
app.use(swStats.getMiddleware({}));

mongoose.connect(
  DBHOST,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () =>
  {
    console.log("connected to the database!!");
    SetupDB.checkDemoExist(function(exist) {
      if(exist) {
        console.log("exists");
        //SetupDB.deleteDemoAccount();
      }
      else {
        console.log("not exists");
        SetupDB.createDemoAccount();
      }
    });
  });
// some changes
// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));



//SetupDB.createDemoAccount();
Simulation.simualte(10000);
SelfCheck.selfcheck(60000);

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

  var port = API_PORT;

  https.createServer(credentials, app).listen(443, function () {
      console.log('Server started @ %s!', 443);
  });

  http.createServer(credentials, app).listen(80, function () {
      console.log('Server started @ %s!', 80);
  });

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    //console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
