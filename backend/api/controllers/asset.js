var userManage = require('./userManage.js');
var shareUtil = require('./shareUtil.js');
var deviceManage = require('./deviceManage.js');
const User = require('../db/user.js');
const Asset = require('../db/asset.js');

var functions = {
  getAssetByUser: getAssetByUser,
  getAssetAttributes: getAssetAttributes,
  createAsset: createAsset,
  updateAsset: updateAsset,
  deleteAsset: deleteAsset
};

for (var key in functions) {
  module.exports[key] = functions[key];
}

function getAssetByUser(req, res) {
  var userid = req.swagger.params.userID.value;
  User.findOne({UserID: userid}, function(err, data)
  {
    if (err) {
      var msg = "Error: " + JSON.stringify(err, null, 2);
      callback(false, msg);
    }
    else {
      if (data)
      {
        var assetslist = data.Assets;
        getSingleAssetInternal(0, assetslist, [], function(assetout){
          shareUtil.SendSuccessWithData(res, assetout);
        });
      } else {
        shareUtil.SendNotFound(res, data);
      }
    }
  });
}



function getSingleAssetInternal(index, assets, assetout, callback) {
  if (index < assets.length) {
    if (index == 0) {
      assetout = [];
    }
    Asset.findOne({AssetID: assets[index].AssetID},function(err,data){
      if (!err) {
        assetout.push(data);
      }
      getSingleAssetInternal(index + 1, assets, assetout, callback);
    });
  } else {
    callback(assetout);
  }
}


function getAssetAttributes(req, res) {
  var assetID = req.swagger.params.AssetID.value;
  Asset.findOne({AssetID: assetID}, function(err, data) {
    if (err) {
      var msg = "Unable to scan the assets table.(getAssets) Error JSON:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    } else {
      shareUtil.SendSuccessWithData(res, data);
    }
  });
}

function createAsset(req, res) {
  var assetobj = req.body;
  if (assetobj.constructor === Object && Object.keys(assetobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    var displayName = assetobj.DisplayName;
    var userid = assetobj.UserID;
    if (displayName && userid) {
      var uuidv1 = require('uuid/v1');
      var crypto = require('crypto');

      let asset = new Asset();

      asset.AssetID = uuidv1();
      asset.LatestTimeStamp = 0;
      asset.DeviceCount = 0;
      asset.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
      asset.DisplayName = displayName;

      asset.save(err => {
        if (err)
        {
          var msg = "Asset Save Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
        else {
          // add asset to user
          User.findOneAndUpdate({UserID: userid},
              {
                $push:  {
                  Assets: {AssetID: asset.AssetID}
                }
              },
            function(err, data) {
            if (err)
            {
              var msg = "User update Error:" + JSON.stringify(err, null, 2);
              shareUtil.SendInternalErr(res,msg);
            }
            else {
              shareUtil.SendSuccess(res);
            }
          });

        }

      });
    }
    else {
      var msg = "UserID or Display Name missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  }
}

// USE by website only
function updateAsset(req, res) {
  var assetobj = req.body;
  var isValid = true;
  if(assetobj.constructor === Object && Object.keys(assetobj).length === 0) {
    isValid  = false;
  } else {
    if (!assetobj.AssetID) {
      isValid  = false;
    } else {
      Asset.findOneAndUpdate({AssetID: assetobj.AssetID}, assetobj, function(err, data)
      {
        if (err)
        {
          var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
          console.error(msg);
          shareUtil.SendInternalErr(res, msg);
        } else {
            shareUtil.SendSuccess(res);
        }


      });
    }
    if (!isValid) {
      shareUtil.SendInvalidInput(res);
    }
  }
}



function deleteAsset(req, res) {
  console.log("entered");
  var assetid = req.swagger.params.AssetID.value;
  var userid = req.swagger.params.UserID.value;
  if (assetid) {
    if (userid) {
      // remove in user table and asset
      Asset.deleteOne({AssetID: assetid}, function(err) {
        if (err)
        {
          var msg = "Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res);
        }
        else{
          User.findOneAndUpdate({UserID: userid}, {
            $pull: {
              Assets: {AssetID: assetid}
            }
          }, function(err, data){
            if (err)
            {
              var msg = "Error:" + JSON.stringify(err, null, 2);
              shareUtil.SendInternalErr(res);
            } else {
                shareUtil.SendSuccess(res);
            }
          });

        }
      });
    } else {
      var msg = "UserID missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  } else {
    var msg = "AssetID missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}
