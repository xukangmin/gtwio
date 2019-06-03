const User = require('../api/db/user.js');
const Asset = require('../api/db/asset.js');
const Parameter = require('../api/db/parameter.js');
const Device = require('../api/db/device.js');
const Dashboard = require('../api/db/dashboard.js');
const Data = require('../api/db/data.js');
const fetch = require('node-fetch');
var fs = require('fs');

var userid = 'USERID0';

var assetid = 'ASSETID0';

var dashboardid = 'DASHBOARDID0';

function createUser(userid) {
  return new Promise(
    (resolve, reject) => {
      var epochtime = Math.floor((new Date).getTime()/1000);
      var uuidv1 = require('uuid/v1');
      var crypto = require('crypto');
      let user = new User();

      user.EmailAddress = 'demo@gtwlabs.com';
      user.Password = 'demo';
      user.UserID =  userid;
      user.Created = epochtime;
      user.VerificationCodeExpire = epochtime + 1800; // expire in 30 minutes
      user.VerificationCode = crypto.randomBytes(20).toString('hex');
      user.ApiKey = crypto.randomBytes(16).toString('hex');
      user.Active = 1;

      user.save(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
  );
}

function createAsset(userid, assetconfig) {
  return new Promise(
    (resolve, reject) => {
      const requestOptions = {
        headers: { 'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({
             'UserID': userid,
             'Config': assetconfig
        })
    };

    fetch(process.env.APP_HOST + ':' + process.env.APP_PORT + '/asset/createAssetByConfig', requestOptions)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return reject(resJSON.message);
            }
            return resJSON;
        })
        .then(ret => {
            resolve(ret);
        });
    });
}

function createDemoAccount() {
  var asconfig0 = require('./assetconfig_default0.json');
  var asconfig1 = require('./assetconfig_default1.json')
  var asconfig2 = require('./assetconfig_default2.json')
  var realsensor = require('./assetconfig_realsensor.json');
  createUser(userid)
  .then(
    ret => {
      return createAsset(userid, asconfig0);
    }
  )
  .then(
    ret => {
      return createAsset(userid, asconfig1);
    }
  )
  .then(
    ret => {
      return createAsset(userid, asconfig2);
    }
  )
  .then(
    ret => {
      return createAsset(userid, realsensor);
    }
  )
  .catch(
    err => {
      console.error(err);
    }
  )
}

function testFunc(username, password) {
  const requestOptions = {
      headers: { 'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({
          'EmailAddress': username,
          'Password': password
      })
  };

  fetch('http://localhost:' + API_PORT + '/user/createUser', requestOptions)
      .then(response => {
          return Promise.all([response, response.json()])
      })
      .then( ([resRaw, resJSON]) => {
          if (!resRaw.ok)
          {
              return Promise.reject(resJSON.message);
          }
          return resJSON;
      })
      .then(user => {
          console.log(user);
      });
}

function deleteDemoAccount() {
  deleteUser(userid);
  deleteAsset(assetid);
  deleteTempSensors();
  deleteDashboard(dashboardid);
}

function checkDemoExist(callback) {
  User.findOne({UserID: userid}, function(err, data) {
    if (err) {
      callback(false);
    } else {
      if (data)
      {
        callback(true);
      } else {
        callback(false);
      }
    }
  });

}

module.exports.createDemoAccount = createDemoAccount;
module.exports.checkDemoExist = checkDemoExist;
module.exports.deleteDemoAccount = deleteDemoAccount;
module.exports.testFunc = testFunc;
