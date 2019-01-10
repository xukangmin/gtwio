var shareUtil = require('./shareUtil.js');
var asset = require('./asset.js');
var deviceManage = require('./deviceManage.js');

var dbCache = shareUtil.dbCache;

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */

 var functions = {
   createVariable: createVariable,
   updateVariable: updateVariable,
   deleteVariable: deleteVariable,
   getVariablebyDevice: getVariablebyDevice,
   getVariableAttributes: getVariableAttributes,
   getVariableByAsset: getVariableByAsset,
   IsVariableExist: IsVariableExist
 }

for (var key in functions) {
  module.exports[key] = functions[key];
}

/*module.exports = {
  createVariable: createVariable,
  updateVariable: updateVariable,
  deleteVariable: deleteVariable,
  getVariablebyDevice: getVariablebyDevice,
  getVariableAttributes: getVariableAttributes,
  getVariableByAsset: getVariableByAsset,
  IsVariableExist: IsVariableExist
};*/


function updateVariableIDInDevice(variableID, deviceID, callback) {
  if(!deviceID) {
    callback(false, null);
  } else {
    checkVariableInDevice(variableID, deviceID, function(ret, msg1) {
      if (ret) {
        var updateParams = {
          TableName : shareUtil.tables.device,
          Key : { DeviceID : deviceID },
          UpdateExpression : 'set #variable = list_append(if_not_exists(#variable, :empty_list), :id)',
          ExpressionAttributeNames: { '#variable': 'Variables' },
          ExpressionAttributeValues: {
            ':id': [variableID],
            ':empty_list': []
          }
        };
        shareUtil.awsclient.update(updateParams, function (err, data) {
          if (err) {
              var msg = "Error:" +  JSON.stringify(err, null, 2);
              console.error(msg);
              callback(false,msg);
          } else {
            callback(true,null);
          }
        });
      } else {
        callback(false, msg1 );
      }
    });
  }
}

function updateDeviceCache(deviceid, variableid, variableName, callback) {
  dbCache.get(deviceid, function(err, value) {
    if (err) {
      console.log('get error', err);
      var cacheObj = {};
      //cacheObj.variableName = variableid
    } else {
      var cacheObj = JSON.parse(value);
      console.log("cacheObj = " + JSON.stringify(cacheObj, null, 2));
      var indexVarNameToDelete = Object.values(cacheObj).indexOf(variableid);
      var varNameToDelete = Object.keys(cacheObj)[indexVarNameToDelete]
      delete cacheObj[varNameToDelete];
    }
    cacheObj[variableName] = variableid;
    var cacheString = JSON.stringify(cacheObj, null, 2);
    console.log("cacheString = " + cacheString);
    dbCache.put(deviceid, cacheString, function(err) {
      if (err){
        console.log('put error', err);
        callback(false);
      } else {
        callback(true);
      }
    });
  });
}

function checkVariableInDevice(variableID, deviceID, callback) {    // return true if Variable NOT in Device
  var params = {
    TableName: shareUtil.tables.device,
    KeyConditionExpression : "DeviceID = :v1",
    ExpressionAttributeValues : {':v1' : deviceID.toString()}
  };
  shareUtil.awsclient.query(params, function(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      callback(false,msg);
    } else {
      if (data.Count == 1) {
        if (typeof data.Items[0].Variables == "undefined") {
          callback(true,null);
        } else {
          if (data.Items[0].Variables.indexOf(variableID) > -1) {
            var msg = "Variable Already exists in Device";
            callback(false,msg);
          } else {
            //console.log("true, null");
            callback(true,null);
          }
        }
      } else {
        var msg = "Error: Cannot find data"
        callback(false,msg);
      }
    }
  });
}

function addVariableInternal(variableobj, deviceid, res) {
  var uuidv1 = require('uuid/v1');
  var crypto = require('crypto');
  if (typeof variableobj.VariableID == "undefined") {
    var variableID = uuidv1();
  } else {
    var variableID = variableobj.VariableID;
  }
  var params = {
    TableName : shareUtil.tables.variable,
    Item : {
      VariableID: variableID,
      AddTimeStamp: Math.floor((new Date).getTime()/1000)
    },
    ConditionExpression : "attribute_not_exists(VariableID)"
  };
  if (variableobj.VariableName) {
    isVariableNameUniqueInDevice(variableobj.VariableName, deviceid, function(ret, data) {
      if (ret) {
        params.Item = Object.assign(params.Item, variableobj);
        delete params.Item['DeviceID'];
        shareUtil.awsclient.put(params, function(err, data) {
          if (err) {
            var msg = "Error:" + JSON.stringify(err, null, 2);
            shareUtil.SendInternalErr(res,msg);
          } else {
            if (deviceid) {
              updateVariableIDInDevice(variableID, deviceid, function(ret1, data) {
                if (ret1) {
                  updateDeviceCache(deviceid, variableID, variableobj.VariableName, function(err) {
                    if (!err) {
                      var msg = "cache of Device not updated"
                      console.log(msg);
                      shareUtil.SendInternalErr(res, msg);
                    } else {
                      console.log("Device cache updated");
                      shareUtil.SendSuccess(res);
                    }
                  });
                } else {
                  var msg = "Error:" + JSON.stringify(data) + "update failed";
                  shareUtil.SendInternalErr(res,msg);
                }
              });
            } else {
              //console.log("variableID = "+ variableID);
              shareUtil.SendSuccess(res);
            }
          }
        });
      } else {
        shareUtil.SendNotFound(res, data);
      }
    });
  } else {
    var msg ="VariableName missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function isVariableNameUniqueInDevice(variableName, deviceid, callback) {
  deviceManage.getVariablesFromDevice(deviceid, function(ret, data) {
    if (ret) {
      var variables = data.Variables;
      //console.log("variables = " + variables.length);
      if (variables) {
        if (variables.length != 0) {
          getVariableNameList(variables, 0, function(ret1, data1) {
            if (ret1) {
              var variableNameList = data1.Responses[shareUtil.tables.variable];
              //console.log("variableNameList" + JSON.stringify(variableNameList, null, 2));
              var arrayList = [];
              convertJSONListToArray(variableNameList, arrayList, 0, function(ret2, data2) {
                if (ret) {
                  deviceManage.isItemInList(variableName, data2, function(ret2, data2) { //return true if item is NOT in the list
                    if (ret2) {
                      callback(true, null);
                    } else {
                      var msg = "VariableName not unique in Device";
                      callback(false, msg)
                    }
                  });
                }
              });
            } else {
              callback(false, data1);
            }
          });
        } else {
          // no variable in device
          callback(true, null);
        }
      } else {
        // no variable in device
        callback(true, null);
      }
    } else {
      callback(false, data);
    }
  });
}

function convertJSONListToArray(JSONlist, array, index, callback){
  if(index < JSONlist.length) {
    array.push(JSONlist[index].VariableName);
    convertJSONListToArray(JSONlist, array, index+1, callback);
  } else {
    callback(true, array);
  }
}

function getVariableNameList(variablesArrayID, index, callback) {
  var itemsToGetArray = [];
  fillParamsArray(variablesArrayID, itemsToGetArray, 0, function(ret, data){
    if (ret) {
      var variablesParam = {
        RequestItems : {
          "Hx.Variable" : {
            Keys : data,    //itemsToAddArray
            ProjectionExpression : "VariableName"
          }
        }
      }
      shareUtil.awsclient.batchGet(variablesParam, onGet);
      function onGet(err, data1){
        if (err) {
          var msg = "Error:" +  JSON.stringify(err, null, 2);
          callback(false, msg);
        } else {
          callback(true, data1);
        }
      }
    } else {
      shareUtil.SendNotFound(res, data);
    }
  });
}

function fillParamsArray(variablesArrayID, itemsToGetArray, index, callback){
  if(index < variablesArrayID.length){
    var variableid = variablesArrayID[index];
    var itemToGet =
    {
      "VariableID" : variableid
    }
    itemsToGetArray.push(itemToGet);
    fillParamsArray(variablesArrayID, itemsToGetArray, index+1, callback);
  } else {
    callback(true, itemsToGetArray);
  }
}

function createVariable(req, res) {
  var variableobj = req.body;
  var deviceid = req.swagger.params.DeviceID.value;
  if (deviceid) {
    deviceManage.IsDeviceExist(deviceid, function(ret1, data1){
      if (ret1) {
        if (variableobj.VariableID) {
          IsVariableExist(variableobj.VariableID, function(ret,data){
            if (ret) {
              var msg = "VariableID Already Exists";
              shareUtil.SendInvalidInput(res, msg);
            } else {
              addVariableInternal(variableobj, deviceid, res);
            }
          });
        } else {
          addVariableInternal(variableobj, deviceid, res);
        }
      } else {
        var msg = "DeviceID does not exist";
        shareUtil.SendNotFound(res, msg);
      }
    });
  } else {
    var msg = "DeviceID missing"
    shareUtil.SendNotFound(res, msg);
  }
}

function updateVariableIDInAsset(variableID, assetID, callback) {
  if(!assetID) {
    callback(false, null);
  } else {
    checkVariableInAsset(variableID, assetID, function(ret, msg1) {
      if (ret) {
        var updateVar = {
          TableName : shareUtil.tables.assets,
          Key : { AssetID : assetID },
          UpdateExpression : 'set Variables = list_append(if_not_exists(Variables, :empty_list), :id)',
          ExpressionAttributeValues: {
            ':id': [variableID],
            ':empty_list': []
          }
        };
        shareUtil.awsclient.update(updateVar, function (err, data) {
          if (err) {
            var msg = "Error:" +  JSON.stringify(err, null, 2);
            console.error(msg);
            callback(false,msg);
          } else {
            callback(true,null);
          }
        });
      } else {
        callback(false, msg1 );
      }
    });
  }
}

function checkVariableInAsset(variableID, assetID, callback) {
  var variables = {
    TableName: shareUtil.tables.assets,
    KeyConditionExpression : "AssetID = :v1",
    ExpressionAttributeValues : {':v1' : assetID.toString()}
  };
  shareUtil.awsclient.query(variables, function(err, data) {
  if (err) {
    var msg = "Error:" + JSON.stringify(err, null, 2);
    callback(false,msg);
  } else {
    if (data.Count == 1) {
      if (typeof data.Items[0].Variables == "undefined") {
        callback(true,null);
      } else {
        if (data.Items[0].Variables.indexOf(variableID) > -1) {
          var msg = "variable Already exists in Asset";
          callback(false,msg);
        } else {
          callback(true,null);
        }
      }
    } else {
        var msg = "Error: Cannot find data"
        callback(false,msg);
      }
    }
  });
}

function addVariableInternalToAsset(variableobj, assetid, res) {
  var uuidv1 = require('uuid/v1');
  var crypto = require('crypto');
  if (typeof variableobj.VariableID == "undefined"){
    var variableID = uuidv1();
  } else {
    var variableID = variableobj.VariableID;
  }
  var params = {
    TableName : shareUtil.tables.variable,
    Item : {
      VariableID: variableID,
      AddTimeStamp: Math.floor((new Date).getTime()/1000)
    },
    ConditionExpression : "attribute_not_exists(VariableID)"
  };
  params.Item = Object.assign(params.Item, variableobj);
  delete params.Item['DeviceID'];
  shareUtil.awsclient.put(params, function(err, data) {
    if (err) {
        var msg = "Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
    } else {
      if (assetid) {
        updateVariableIDInAsset(variableID, assetid, function(ret1, data) {
          if (ret1){
            shareUtil.SendSuccess(res);
          } else {
            var msg = "Error:" + JSON.stringify(data) + "update failed";
            shareUtil.SendInternalErr(res,msg);
          }
        });
      } else {
        shareUtil.SendSuccess(res);
      }
    }
  });
}

function addVariableToAsset(req, res) {
  var variableobj = req.body;
  var assetid = req.swagger.params.AssetID.value;
  if (variableobj.VariableID) {
    IsVariableExist(variableobj.VariableID, function(ret,data){
      if (ret) {
        var msg = "VariableID Already Exists";
        shareUtil.SendInvalidInput(res, msg);
      } else {
        addVariableInternalToAsset(variableobj, assetid, res);
      }
    });
  } else {
    if (assetid){
      addVariableInternalToAsset(variableobj, assetid, res);
    } else
    {
      msg = "INVALID_INPUT: no variableID, nor assetID given";
      shareUtil.SendInvalidInput(res, msg);
    }
  }
}

function updateVariable(req, res) {
  var variableobj = req.body;
  var isValid = true;
  if (variableobj.constructor === Object && Object.keys(variableobj).length === 0) {
    SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    if(!variableobj.VariableID) {
      var msg = "Invalid Input: VariableID required";
      shareUtil.SendInvalidInput(res, msg);
    } else {
      IsVariableExist(variableobj.VariableID, function(ret1, data) {
        if (ret1) {
          if (variableobj.VariableName) {
            if (variableobj.DeviceID) {
              checkVariableInDevice(variableobj.VariableID, variableobj.DeviceID, function(ret2, data2) {
                if (!ret2) {
                  isVariableNameUniqueInDevice(variableobj.VariableName, variableobj.DeviceID, function(ret3, data3) {
                    if (ret3) {
                      updateVariableInternal(variableobj, data, function(ret4, data4) {
                        if (ret4) {
                          shareUtil.SendSuccess(res);
                        } else {    //update failed
                          shareUtil.SendInvalidInput(res, data4);
                        }
                      });
                    } else {  // varName not unique in device
                      shareUtil.SendInvalidInput(res, data3);
                    }
                  });
                } else {
                  var msg = "Variable not found in this Device";
                  shareUtil.SendInvalidInput(res, msg);
                }
              });
            } else {
              var msg = "DeviceID is required to update VariableName";
              shareUtil.SendInvalidInput(res, msg);
            }
          } else {      // VariableName not being updated
            if (Object.keys(variableobj).length > 1) {
              updateVariableInternal(variableobj, data, function(ret4, data4) {
                if (ret4) {
                  shareUtil.SendSuccess(res);
                } else {    //update failed
                  shareUtil.SendInvalidInput(res, data4);
                }
              });
            } else {
              var msg = "At least one other attribute than VariableID is required to update the Variable";
              shareUtil.SendInvalidInput(res, msg);
            }
          }
        } else {
          var msg = "Variable does not exist";
          shareUtil.SendInvalidInput(res, msg);
        }
      });
    }
  }
}

function updateVariableInternal(variableobj, data, callback) {
  var updateItems = "set ";
  var expressvalues = {};
  var deviceid = variableobj.DeviceID;
  var i = 0
  if (variableobj.DeviceID) {
    delete variableobj.DeviceID;
  }
  for (var key in variableobj) {
    if (variableobj.hasOwnProperty(key)) {
      if (key != "VariableID") {
        updateItems = updateItems + key.toString() + " = :v" + i.toString() + ",";
        expressvalues[":v" + i.toString()] = variableobj[key];
        i++;
      }
    }
  }
  updateItems = updateItems.slice(0, -1);
  var updateParams = {
        TableName : shareUtil.tables.variable,
        Key : {
          VariableID: data.Items[0].VariableID
      },
      UpdateExpression : updateItems,
      ExpressionAttributeValues : expressvalues
    };
  shareUtil.awsclient.update(updateParams, function (err, data) {
    if (err) {
      var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
      console.error(msg);
      callbcak(false, msg);
    } else {
      if (variableobj.VariableName) {
        updateDeviceCache(deviceid, variableobj.VariableID, variableobj.VariableName, function(ret, data1) {
          if (ret) {
            callback(true);
          } else {
            var msg = "Device cache not updated"
            callback(false, msg);
          }
        });
      } else {
        callback(true);
      }
    }
  });
}

function deleteSingleVariable(variableID, callback) {
  var deleteParams = {
    TableName : shareUtil.tables.variable,
    Key : { VariableID : variableID }
  };
  shareUtil.awsclient.delete(deleteParams, onDelete);
  function onDelete(err, data) {
    if (err) {
      var msg = "Unable to delete the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
      console.error(msg);
      var errmsg = { message: msg };
      callback(false, msg);
    } else {
      var msg = { message: "Success" };
      callback(true, null);
    }
  }
}

function findVariableIndexInDevice(deviceID, variableID, callback){
  var devicesParams = {
    TableName : shareUtil.tables.device,
    KeyConditionExpression : "DeviceID = :V1",
    ExpressionAttributeValues :  { ':V1' : deviceID},
    ProjectionExpression : "Variables"
  };
  shareUtil.awsclient.query(devicesParams, onQuery);
  function onQuery(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res, msg);
    } else {
      if (data.Count == 0) {
        var msg = "DeviceID does not exist or Device does not contain any Variable";
        callback(false, msg);
      } else {
        // find index of device in devices list coming from the result of the query in the Asset table
        var variables = data.Items[0].Variables;
        var variableIndex;
        var index = 0;
        console.log("variables = " + variables);
        if (typeof variables == "undefined") {
          //console.log("undefined");
          var msg = "DeviceID does contain any Variable";
          callback(false, msg);
        } else {
          while (index < variables.length) {
            //console.log("variables.Items[0]: " + variables[index]);
            if (variables[index] == variableID) {
              variableIndex = index;
              index  = variables.length;
            } else {
              index +=1;
            }
          }
        }
      }
      if (index > 0) {
        deleteVarFromDeviceList(variableIndex, deviceID, function(ret2, msg){
          if (ret2){
            deleteVariableFromDeviceCache(deviceID, variableID, function(ret3) {
              if (ret3) {
                callback(true);
              } else {
                var msg = "Delete variable from Device cache has failed";
                callback(false, msg);
              }
            })
          } else {
            callback(false, msg);
          }
        });
      }
    }
  }
}

function deleteVarFromDeviceList(variableIndex, deviceID, callback) {
  if (typeof variableIndex == "undefined") {
    var msg = "Variable not found in Device's list of Variables";
    callback(false, msg);
  } else {
    var updateExpr = "remove Variables[" + variableIndex + "]";
    var updateDevice = {
      TableName : shareUtil.tables.device,
      Key : {DeviceID : deviceID},
      UpdateExpression : updateExpr
    };
    shareUtil.awsclient.update(updateDevice, onUpdate);
    function onUpdate(err, data) {
      if (err) {
        var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
        console.error(msg);
        var errmsg = { message: msg };
        callback(false, msg);
      } else {
        callback(true);
      }
    }
  }
}

function deleteVariableFromDeviceCache(deviceid, variableid, callback) {
  dbCache.get(deviceid, function(err, value) {
    if (err) {    // device was not in the cache
      console.log('get error', err);
      callback(true);
    } else {
      var cacheObj = JSON.parse(value);
      console.log("cacheObj = " + JSON.stringify(cacheObj, null, 2));
      var indexVarNameToDelete = Object.values(cacheObj).indexOf(variableid);
      var varNameToDelete = Object.keys(cacheObj)[indexVarNameToDelete];
      delete cacheObj[varNameToDelete];
      var cacheString = JSON.stringify(cacheObj, null, 2);
      console.log("cacheString = " + cacheString);
      dbCache.put(deviceid, cacheString, function(err) {
        if (err){
          console.log('put error', err);
          callback(false);
        } else {
          callback(true);
        }
      });
    }
  });
}

function findVariableIndexInAsset(assetID, variableID, callback){
  var assetsParams = {
    TableName : shareUtil.tables.assets,
    KeyConditionExpression : "AssetID = :V1",
    ExpressionAttributeValues :  { ':V1' : assetID},
    ProjectionExpression : "Variables"
  };
  shareUtil.awsclient.query(assetsParams, onQuery);
  function onQuery(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      callback(false, msg)
    } else {
      if (data.Count == 0) {
        var msg = "AssetID does not exist or Asset does not contain any Variable";
        callback(false, msg);
      } else {
        // find index of device in devices list coming from the result of the query in the Asset table
        var variables = data.Items[0].Variables;
        var variableIndex;
        var index = 0;
        if ( typeof variables == "undefined") {
          var msg =  "AssetID does not exist or Asset does not contain any Variable";
          shareUtil.SendNotFound(res, msg);
        } else {
          while (index < variables.length) {
            //console.log("variables.Items[0]: " + variables[index]);
            if (variables[index] == variableID) {
              variableIndex = index;
              index  = variables.length;
            } else {
              index +=1;
            }
          }
        }
      }
      if (index > 0) {
        deleteVarFromAssetList(variableIndex, assetID, function(ret2, msg) {
          if (ret2) {
            callback(true);
          } else {
            callback(false, msg);
          }
        });
      }
    }
  }
}

function deleteVarFromAssetList(variableIndex, assetID, callback) {
  if (typeof variableIndex == "undefined") {
    var msg = "Variable not found in Asset's list of Variables";
    callback(false, msg);
  } else {
    //console.log("variable.index = " + variableIndex);
    var updateExpr = "remove Variables[" + variableIndex + "]";
    var updateAsset = {
      TableName : shareUtil.tables.assets,
      Key : {AssetID : assetID},
      UpdateExpression : updateExpr
    };
    shareUtil.awsclient.update(updateAsset, onUpdate);
    function onUpdate(err, data) {
      if (err) {
        var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res, msg);
      } else {
        callback(true);
      }
    }
  }
}

// Delete device by deviceID
function deleteVariable(req, res) {
  var variableID = req.swagger.params.VariableID.value;
  var deviceID = req.swagger.params.DeviceID.value;
  IsVariableExist(variableID, function(ret1, data) {
    if (ret1) {
      if (deviceID) {
        findVariableIndexInDevice(deviceID, variableID, function(ret2, data) {
          if (ret2) {
            deleteSingleVariable(variableID, function(ret, data) {
              if (ret) {
                shareUtil.SendSuccess(res);
              } else {
                var msg = "Error:" + JSON.stringify(data);
                shareUtil.SendInternalErr(res, msg);
              }
            });
          } else {
            var msg = "Error:" + JSON.stringify(data);
            shareUtil.SendInternalErr(res, msg);
          }
        });
      } else {
        var msg = "DeviceID required";
        shareUtil.SendNotFound(res, msg);
      }
    } else {
      //var msg = " DeviceID does not exist";
      var errmsg = { message: "VariableID does not exist" };
      res.status(400).send(errmsg);
    }
  });
}

function getVariablebyDevice(req, res) {
  var deviceid = req.swagger.params.DeviceID.value;
  getVariablebyDeviceID(deviceid, function(ret, data) {
    if (ret) {
      shareUtil.SendSuccessWithData(res, data);
    } else {
      shareUtil.SendNotFound(res, data);
    }
  });
}

function getVariablebyDeviceID(deviceid, callback) {
  var variablesParams = {
    TableName : shareUtil.tables.device,
    KeyConditionExpression : "DeviceID = :V1",
    ExpressionAttributeValues :  { ':V1' : deviceid},
    ProjectionExpression : "Variables"
  };
  shareUtil.awsclient.query(variablesParams, onQuery);
  function onQuery(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      callback(false, msg);
    } else {
      var sendData = {
        Items: [],
        Count: 0
      };
      if (data.Count == 0) {
        var msg = "DeviceID does not exist" ;
        callback(false, msg);
      } else {
        var variables = data.Items[0].Variables;
        if (typeof variables == "undefined") {
          var msg = "DeviceID does not contain any variable";
          callback(false, msg);
        } else {
          if (variables.length == 0) {
            var msg = "No Variable found in Device";
            callback(false, msg);
          } else {
            var gottenVar = [];
            batchGetVariablesAttributes(variables, gottenVar, function(ret, variablesdata) {
              sendData.Items = variablesdata.Responses[shareUtil.tables.variable];
              sendData.Count = variablesdata.Responses[shareUtil.tables.variable].length;
              callback(true, sendData);
            });
          }
        }
      }
    }
  }
}

function batchGetVariablesAttributes(variableidList, gottenVar, callback) {
  fillBatchGetItem(variableidList, gottenVar, 0, function(ret, data) {
    if (ret) {
      var dataParams = {
        RequestItems : {
          "Hx.Variable" : {
            Keys : data
          }
        }
      }
      shareUtil.awsclient.batchGet(dataParams, onGet);
      function onGet(err, data1) {
        if (err) {
          var msg = "Error:" +  JSON.stringify(err, null, 2);
          callback(false, msg);
        } else {
          callback(true, data1);
        }
      }
    } else {
      callback(false, data);
    }
  });
}

function fillBatchGetItem(variableidList, getItems, index, callback) {
  if (index < variableidList.length) {
    var getItem = { "VariableID" : variableidList[index] }
    getItems.push(getItem);
    fillBatchGetItem(variableidList, getItems, index+1, callback);
  } else {
    callback(true, getItems);
  }
}

function deleteGarbageVariablesInDevice(sendData, deviceid, variablesToDelete, callback) {
  var updateExpr = "remove ";
  for (var k in variablesToDelete) {
    updateExpr = updateExpr + "Variables[" + variablesToDelete[k] + "], ";
  }
  var updateDevice = {
    TableName : shareUtil.tables.device,
    Key : {DeviceID : deviceid},
    UpdateExpression : updateExpr.slice(0, -2)        // slice to delete ", " at the end of updateExpr
  };
  shareUtil.awsclient.update(updateDevice, onUpdate);
  function onUpdate(err, data) {
    if (err) {
      var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
      console.error(msg);
    } else {
      callback(sendData);
    }
  }
}

function getSingleVariableInternal(index, variables, deviceid, variablesToDelete, deleteIndex, variableout, callback) {
  if (index < variables.length) {
    if (index == 0) {
      variableout = [];
    }
    var variablesParams = {
      TableName : shareUtil.tables.variable,
      KeyConditionExpression : "VariableID = :v1",
      ExpressionAttributeValues : { ':v1' : variables[index]}
    };
    shareUtil.awsclient.query(variablesParams, onQuery);
    function onQuery(err, data) {
      if (!err)  {
        if (data.Count == 1) {
          variableout.push(data.Items[0]);
        } else {
          variablesToDelete[deleteIndex] = index;
          deleteIndex+=1;
        }
      }
      getSingleVariableInternal(index + 1, variables, deviceid, variablesToDelete, deleteIndex, variableout, callback);
    }
  } else {
    callback(variableout, variablesToDelete);
  }
}

function getVariablesFromDeviceArray(devices, index, variablesout, callback) {
  if(index < devices.length) {
    getVariablebyDeviceID(devices[index], function(ret, data) {
      if (ret) {
        var i = 0;
        for ( i in data.Items) {
          variablesout.push(data.Items[i]);
        }
      }
      getVariablesFromDeviceArray(devices, index+1, variablesout, callback);
    });
  } else {
    callback(true, variablesout)
  }
}

function getVariableByAssetIDOld(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var parametersParams = {
    TableName : shareUtil.tables.assets,
    KeyConditionExpression : "AssetID = :V1",
    ExpressionAttributeValues :  { ':V1' : assetid},
    ProjectionExpression : "Variables"
  };
  shareUtil.awsclient.query(parametersParams, onQuery);
  function onQuery(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res, msg);
    } else {
      var sendData = {
        Items: [],
        Count: 0
      };
      if (data.Count == 0) {
        var msg = "AssetID not found";
        shareUtil.SendNotFound(res, msg);
      } else {
        var variables = data.Items[0].Variables;
        if (typeof variables == "undefined") {
          msg = "No Variable found in this Asset";
          shareUtil.SendNotFound(res, msg);
        } else {
          if (variables.length == 0) {
            msg = "No Variable found in this Asset";
            shareUtil.SendNotFound(res, msg);
          } else {;
            var variablesToDelete = [];
            var deleteIndex = 0;
            getSingleVariableInternal(0, variables, assetid, variablesToDelete, deleteIndex,null, function(variablesdata, variablesToDelete) {
              sendData.Items = variablesdata;
              sendData.Count = variablesdata.length;
              if (variablesToDelete.length == 0) {
                shareUtil.SendSuccessWithData(res, sendData);
              } else {
                deleteGarbageVariablesInAsset(sendData, assetid, variablesToDelete, function(sendData){
                  shareUtil.SendSuccessWithData(res, sendData);
                });
              }
            });
          }
        }
      }
    }
  }
}

function getVariableByAsset(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var sendData = {
    Items: [],
    Count: 0
  };
  asset.getDevicesFromAsset(assetid, function(ret, data) {
    if (ret) {
      var devices = data.Devices;
      var variablesout = [];
      if (devices) {
        var gottenDevVar = [];
        batchGetDevicesVariables(devices, gottenDevVar, function (ret1, data1) {
          if (ret1) {
            var devicesVar = data1.Responses['Hx.Device'];
            var gottenVar = [];
            batchGetVariablesAttributesFromDevices(devicesVar, 0, gottenVar, function(ret2, data2) {
              if (ret2) {
                console.log("data2 = " + JSON.stringify(data2, null, 2));
                sendData.Items = data2.Responses[shareUtil.tables.variable];
                sendData.Count = data2.Responses[shareUtil.tables.variable].length;
                shareUtil.SendSuccessWithData(res, sendData);
              } else {
                var msg = "No variables found in Asset's devices";
                shareUtil.SendNotFound(res, msg);
              }
            });
          }
        });
      } else {
        var msg = "No device in Asset -> no variable in Asset";
        shareUtil.SendInvalidInput(res, msg);
      }
    } else {
      // get Devices from Asset failed
      shareUtil.SendNotFound(res, data);
    }
  });
}

function batchGetVariablesAttributesFromDevices(devicesVar, index, gottenVar, callback) {
  fillBatchGetItemVariablesFromDevices(devicesVar, gottenVar, 0, function(ret, data) {
    if (ret) {
      var dataParams = {
        RequestItems : {
          "Hx.Variable" : {
            Keys : data
          }
        }
      }
      shareUtil.awsclient.batchGet(dataParams, onGet);
      function onGet(err, data1) {
        if (err) {
          var msg = "Error:" +  JSON.stringify(err, null, 2);
          callback(false, msg);
        } else {
          callback(true, data1);
        }
      }
    } else {
      callback(false, data);
    }
  });
}

function fillBatchGetItemVariablesFromDevices(devicesVar, getItems, index, callback) {
  if (index < devicesVar.length) {
    if (devicesVar[index].Variables && devicesVar[index].Variables.length > 0) {
      pushVariablesIntoVarArray(devicesVar[index].Variables, 0, getItems, function(ret, data) {
        if (ret) {
          fillBatchGetItemVariablesFromDevices(devicesVar, getItems, index+1, callback);
        }
      });
    } else {
      fillBatchGetItemVariablesFromDevices(devicesVar, getItems, index+1, callback);
    }
  } else {
    callback(true, getItems);
  }
}

function pushVariablesIntoVarArray(variables, index, getItems, callback) {
  if (index < variables.length) {
    var getItem = {
      "VariableID" : variables[index]
    }
    getItems.push(getItem);
    pushVariablesIntoVarArray(variables, index+1, getItems, callback)
  } else {
    callback(true, getItems);
  }
}

function batchGetDevicesVariables(deviceidList, gottenDev, callback) {
  deviceManage.fillBatchGetItemDevices(deviceidList, gottenDev, 0, function(ret, data) {
    if (ret) {
      var params = {
        RequestItems : {
          "Hx.Device" : {
            Keys : data,
            ProjectionExpression : "Variables"
          }
        }
      }
      shareUtil.awsclient.batchGet(params, onGet);
      function onGet(err, data1) {
        if (err) {
          var msg = "Error:" +  JSON.stringify(err, null, 2);
          callback(false, msg);
        } else {
          callback(true, data1);
        }
      }
    } else {
      callback(false, data);
    }
  });
}

function deleteGarbageVariablesInAsset(sendData, assetid, variablesToDelete, callback) {
  var updateExpr = "remove ";
  for (var k in variablesToDelete) {
    updateExpr = updateExpr + "Variables[" + variablesToDelete[k] + "], ";
  }
  var updateAsset = {
    TableName : shareUtil.tables.assets,
    Key : {AssetID : assetid},
    UpdateExpression : updateExpr.slice(0, -2)        // slice to delete ", " at the end of updateExpr
  };
  shareUtil.awsclient.update(updateAsset, onUpdate);
  function onUpdate(err, data) {
    if (err) {
      var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
      console.error(msg);
    } else {
      //console.log("variables deleted from Asset list !");
      callback(sendData);
    }
  }
}

function getVariableAttributes(req, res) {
  var variableid = req.swagger.params.VariableID.value;
  var variableParams = {
    TableName: shareUtil.tables.variable,
    KeyConditionExpression : "VariableID = :v1",
    ExpressionAttributeValues : { ':v1' : variableid.toString()}
  }
  shareUtil.awsclient.query(variableParams, onQuery);
  function onQuery(err, data) {
    if (err) {
      var msg =  "Unable to scan the variable table.(getVariable) Error JSON:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    } else {
      if (data.Count == 0) {
        shareUtil.SendNotFound(res);
      } else {
        shareUtil.SendSuccessWithData(res, data.Items[0]);
      }
    }
  }
}

function IsVariableExist(variableID, callback) {
  var Params = {
     TableName : shareUtil.tables.variable,
     KeyConditionExpression : "VariableID = :v1",
     ExpressionAttributeValues : {':v1' : variableID.toString()}
  };
  shareUtil.awsclient.query(Params, onQuery);
  function onQuery(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      SendInternalErr(res, msg);
    } else {
      if (data.Count == 0) {
        callback(false, data);
      } else {
        callback(true, data);
      }
    }
  }
}
