//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');

// parameter is predefined like temperature, Humidity, heat transfer rate
// with equations depending on each other
// it can also handle unit conversions

var functions = {
  createParameter: createParameter,
  updateParameter: updateParameter,
  deleteParameter: deleteParameter,
  addParameterToDevice: addParameterToDevice,  // automatically add to asset
  removeParameterFromDevice: removeParameterFromDevice, // automatically remove from asset
  getParameterByAsset: getParameterByAsset,
  getParameterbyDevice: getParameterbyDevice,
  getParameterAttributes: getParameterAttributes
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function createParameter(req, res) {
  var paraobj = req.body;

  var uuidv1 = require('uuid/v1');
  var crypto = require('crypto');

  let para = new Parameter();

  for (var key in paraobj)
  {
    para[key] = paraobj[key];
  }

  para.ParameterID = uuidv1();
  para.AddTimeStamp = Math.floor((new Date).getTime() / 1000);

  para.save(err => {
    if (err)
    {
      var msg = "parameter Save Error:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    }
    else {
      shareUtil.SendSuccess(res);

    }

  });
}

function updateParameter(req, res) {
  var paraobj = req.body;
  var isValid = true;
  if (paraobj.constructor === Object && Object.keys(paraobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    if (!paraobj.ParameterID) {
      shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
    } else {
      Parameter.findOneAndUpdate({ParameterID: paraobj.ParameterID}, paraobj, function(err, data)
      {
        if (err)
        {
          var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
          console.error(msg);
          shareUtil.SendInternalErr(res, msg);
        } else {
            shareUtil.SendSuccess(res);
        }
      });
    }
  }
}

function deleteParameter(req, res) {
  var parID = req.swagger.params.ParameterID.value;

    if (parID) {
      // remove in user table and asset
      Parameter.deleteOne({DeviceID: parID}, function(err) {
        if (err)
        {
          var msg = "Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res);
        }
        else{
          shareUtil.SendSuccess(res);
        }
      });
    } else {
      var msg = "parID missing";
      shareUtil.SendInvalidInput(res, msg);
    }
}



function addParameterToDevice(req, res) {
  var parID = req.swagger.params.ParameterID.value;
  var deviceID =  req.swagger.params.DeviceID.value;
  var assetID =  req.swagger.params.AssetID.value;
    if (parID && deviceID && assetID) {
      // remove in user table and asset
      Asset.findOneAndUpdate({AssetID: assetID},
          {
            $push:  {
              Parameters: {ParameterID: parID}
            }
          },
        function(err, data) {
        if (err)
        {
          var msg = "par update Error in assets:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
        else {
          Device.findOneAndUpdate({DeviceID: deviceID},
              {
                $push:  {
                  Parameters: {ParameterID: parID}
                }
              },
            function(err, data) {
            if (err)
            {
              var msg = "par update Error in devices:" + JSON.stringify(err, null, 2);
              shareUtil.SendInternalErr(res,msg);
            }
            else {
              shareUtil.SendSuccess(res);
            }
          });
        }
      });



    } else {
      var msg = "parID or deviceid or assetid missing";
      shareUtil.SendInvalidInput(res, msg);
    }
}

function removeParameterFromDevice(req, res) {
  var parID = req.swagger.params.ParameterID.value;
  var deviceID =  req.swagger.params.DeviceID.value;
  var assetID =  req.swagger.params.AssetID.value;

  Device.findOneAndUpdate({DeviceID: deviceID},
      {
        $pull:  {
          Parameters: {ParameterID: parID}
        }
      },
    function(err, data) {
    if (err)
    {
      var msg = "par update Error in devices:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    }
    else {

      Asset.findOneAndUpdate({AssetID: assetID},
          {
            $pull:  {
              Parameters: {ParameterID: parID}
            }
          },
        function(err, data) {
        if (err)
        {
          var msg = "par update Error in assets:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
        else {
          shareUtil.SendSuccess(res);
        }
      });

    }
  });

}

function getParameterByAsset(req, res) {

}

function getParameterbyDevice(req, res) {
}

function getParameterAttributes(req, res) {
}
