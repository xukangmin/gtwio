
var shareUtil = require('./shareUtil.js');
var variableManage = require('./variableManage.js');
var deviceManage = require('./deviceManage.js');
var userManage = require('./userManage.js');
var dataCalcul = require('./dataCalcul.js')

var levelup = require('levelup');
var leveldown = require('leveldown');
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
  getSingleDataByVariableID: getSingleDataByVariableID,
  getMultipleDataByVariableID: getMultipleDataByVariableID,
  addDataByDeviceID: addDataByDeviceID,
  addDataByVariableID: addDataByVariableID,
  addDataByDeviceName: addDataByDeviceName,
  addDataBySerialNumber: addDataBySerialNumber,
  fillBatchGetItem: fillBatchGetItem,
  addDataByVariableIDINternal: addDataByVariableIDINternal,
  getMultipleDataByVariableIDInternal : getMultipleDataByVariableIDInternal
};

for (var key in functions) {
  module.exports[key] = functions[key];
}


function fillDataArray(dataArray, timestamp, itemsToAddArray, index, callback) {
  if (index < dataArray.length) {
    var variableid = dataArray[index].VariableID;
    var value = dataArray[index].Value;
    if (variableid) {
      if (value) {
        variableManage.IsVariableExist(variableid, function(ret, data) {
          if (ret) {
            if (timestamp) {
              var itemToAdd = {
                PutRequest : {
                  Item : {
                    "VariableID" : variableid,
                    "Value" : value,
                    "EpochTimeStamp" : timestamp
                  }
                }
              }
            } else { // no timestamp provided
              var itemToAdd = {
                PutRequest : {
                  Item : {
                    "VariableID" : variableid,
                    "Value" : value,
                    "EpochTimeStamp" : Math.floor((new Date).getTime()/1000)
                  }
                }
              }
            }
            itemsToAddArray.push(itemToAdd);
          } else {
            var msg = "VariableID: " + variableid + " does not exist";
            callback(false, msg);
            return;     //to avoid that server stay stuck after any error
          }
          fillDataArray(dataArray, timestamp, itemsToAddArray, index + 1, callback);
        });
      } else {
        var msg = "missing Value for VariableID: " + variableid + " (item number " + index + ")";
        callback(false, msg);
        return;     //to avoid that server stay stuck after any error
      }
    } else {
      var msg = "missing VariableID for item number " + index;
      callback(false, msg);
      return;     //to avoid that server stay stuck after any error
    }
  } else {
    callback(true, itemsToAddArray);
  }
}

function batchAddData(itemsToAddArray, callback) {    // !! Hx.Data hardcoded !!
  var dataParams = {
    RequestItems : {
      "Hx.Data" : itemsToAddArray
    }
  }
  shareUtil.awsclient.batchWrite(dataParams, onPut);
  function onPut(err, data) {
    if (err) {
      var msg = "Error:" +  JSON.stringify(err, null, 2);
      callback(false, msg);
      return;   //to avoid that server stay stuck after any error
    } else {
      callback(true, null);
    }
  }
}

function addDataByVariableID(req, res) {     // !! Hx.Data hardcoded !!
  var dataobj = req.body;
  var dataArray = dataobj.Data;
  var timestamp = dataobj.Timestamp;
  addDataByVariableIDINternal(dataArray, timestamp, function(ret, data) {
    if (ret) {
      shareUtil.SendSuccess(res);
    } else {
      if (data == 'NOT_FOUND') {
        shareUtil.SendNotFound(res);
      } else {
        shareUtil.SendInternalErr(res);
      }
    }
  });
}

function addDataByVariableIDINternal(dataArray, timestamp, callback) {
  var itemsToAddArray = [];
  fillDataArray(dataArray, timestamp, itemsToAddArray, 0, function(ret, data) {
    if (ret) {
      batchAddData(data, function(ret1, data1) {
        if (ret1) {
          callback(true);
          dataCalcul.triggerCalculData(data, 0);
        } else {
          callback(false, data1);
        }
      });
    } else {
      callback(false, 'NOT_FOUND');
    }
  });
}

function addDataBySerialNumber(req, res) {
  var serialNumber = req.swagger.params.SerialNumber.value;
  var timestamp = req.body.Timestamp;
  var Data = req.body.Data;
  if (Data.Data.length != 0){
    deviceManage.getDeviceIdBySerialNumber(serialNumber, function(ret, data) {
      var deviceid = data;
      //console.log("deviceid = " + JSON.stringify(deviceid, null, 2));
      addDataByDeviceIDInternal(deviceid, Data, timestamp, function(ret, data) {
        if (ret) {
          shareUtil.SendSuccess(res);
        } else {
          var msg = "Error: " + JSON.stringify(data, null, 2);
          shareUtil.SendInternalErr(res, msg);
        }
      });
    });
  } else {
    var msg = "No data provided";
    shareUtil.SendInvalidInput(res, msg);
  }
}

// no use of cache to get device name
function addDataByDeviceNameOld(req, res) {
  var deviceName = req.swagger.params.DeviceName.value;
  var apiKey = req.headers["x-api-key"];
  var Data = req.body.Data;
  var timestamp = req.body.Timestamp;
  if (Data.Data.length != 0) {
    userManage.getUserbyApiKeyQuery(apiKey, function (ret, data) {
      if (ret) {
        var devices = data.Items[0].Devices;
        deviceManage.getDevicesDisplayName(devices, function(ret1, data1) {
          if (ret1) {
            var devIDtoNameMap = data1.Responses[shareUtil.tables.device];
            var devObj = {};
            convertDevIDtoDevNameArrayIntoObj(devIDtoNameMap, devObj, 0, function(ret2, data2) {
              if (ret2) {
                var deviceid = data2[deviceName];
                if (deviceid) {
                  addDataByDeviceIDInternal2(deviceid, Data, timestamp, function(ret, data) {
                    if (ret) {
                      shareUtil.SendSuccess(res);
                    } else {
                      var msg = "Error: " + JSON.stringify(data, null, 2);
                      shareUtil.SendInternalErr(res, msg);
                    }
                  });
                } else {
                  var msg = "No device found with this Device name";
                  shareUtil.SendInvalidInput(res, msg);
                }
              } else {
                shareUtil.SendInvalidInput(res);
              }
            });
          } else {
            shareUtil.SendInvalidInput(res, data);
          }
        });
      } else {
        shareUtil.SendInvalidInput(res, data);
      }
    });
  } else {
    var msg = "No data provided";
    shareUtil.SendInvalidInput(res, msg);
  }
}

// use of cache to get the device name
function addDataByDeviceName(req, res) {
  var deviceName = req.swagger.params.DeviceName.value;
  var apiKey = req.headers["x-api-key"];
  var Data = req.body.Data;
  var timestamp = req.body.Timestamp;
  if (Data.Data.length != 0) {
    if (apiKey) {
      dbCache.get(apiKey, function(err, value) {
        if (err) {
          console.log('get error', err);
          userManage.getUserbyApiKeyQuery(apiKey, function (ret, data) {
            if (ret) {
              var devices = data.Items[0].Devices;
              deviceManage.getDevicesDisplayName(devices, function(ret1, data1) {
                if (ret1) {
                  var devIDtoNameMap = data1.Responses[shareUtil.tables.device];
                  var devObj = {};
                  convertDevIDtoDevNameArrayIntoObj(devIDtoNameMap, devObj, 0, function(ret2, data2) {
                    if (ret2) {
                      var deviceid = data2[deviceName];
                      var cacheObj = {};
                      cacheObj[deviceName] = deviceid;
                      var cacheString = JSON.stringify(cacheObj, null, 2);
                      dbCache.put(apiKey, cacheString, function(err) {
                        if (err) {
                          console.log('put error', err);
                        } else {
                          if (deviceid) {
                            addDataByDeviceIDInternal2(deviceid, Data, timestamp, function(ret, data) {
                              if (ret) {
                                shareUtil.SendSuccess(res);
                              } else {
                                var msg = "Error: " + JSON.stringify(data, null, 2);
                                shareUtil.SendInternalErr(res, msg);
                              }
                            });
                          } else {
                            var msg = "No device found with this Device name";
                            shareUtil.SendInvalidInput(res, msg);
                          }
                        }
                      });
                    } else {
                      shareUtil.SendInvalidInput(res);
                    }
                  });
                } else {
                  shareUtil.SendInvalidInput(res, data);
                }
              });
            } else {
              shareUtil.SendInvalidInput(res, data);
            }
          });
        } else {    // user api key in cache
          getDeviceIDfromUserCache(apiKey, value, function(ret, deviceid) {
            if (ret) {
              addDataByDeviceIDInternal2(deviceid, Data, timestamp, function(ret, data) {
                if (ret) {
                  shareUtil.SendSuccess(res);
                } else {
                  var msg = "Error: " + JSON.stringify(data, null, 2);
                  shareUtil.SendInternalErr(res, msg);
                }
              });
            } else {     // DeviceID not in the cache
              addDeviceNametoCache(apiKey, deviceName, value, function(ret, deviceid) {
                if (ret) {
                  addDataByDeviceIDInternal2(deviceid, Data, timestamp, function(ret, data) {
                    if (ret) {
                      shareUtil.SendSuccess(res);
                    } else {
                      var msg = "Error: " + JSON.stringify(data, null, 2);
                      shareUtil.SendInternalErr(res, msg);
                    }
                  });
                } else {
                  var msg = "Error while adding deviceName to cache";
                  shareUtil.SendInvalidInput(res, deviceid);
                }
              });
            }
          });
        }
      });
    } else {
      var msg = "ApiKey missing from header";
      shareUtil.SendInvalidInput(res, msg);
    }
  } else {
    var msg = "No data provided";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function getDeviceIDfromUserCache(deviceName, value, callback) {
  console.log("cacheObj in getDeviceIDfromUserCache = " + value);
  var cacheObj = JSON.parse(value);
  if (cacheObj[deviceName]) {
    var deviceid = cacheObj[deviceName];
    callback(true, deviceid);
  } else {      // APi key in the cache but deviceName not in cache value corresponding to this APi key
    callback(false);
  }
}

function addDeviceNametoCache(apiKey, deviceName, value, callback) {
  userManage.getUserbyApiKeyQuery(apiKey, function (ret, data) {
    if (ret) {
      var devices = data.Items[0].Devices;
      deviceManage.getDevicesDisplayName(devices, function(ret1, data1) {
        if (ret1) {
          var devIDtoNameMap = data1.Responses[shareUtil.tables.device];
          var devObj = {};
          convertDevIDtoDevNameArrayIntoObj(devIDtoNameMap, devObj, 0, function(ret2, data2) {
            if (ret2) {
              if (data2[deviceName]) {  // check to make sure deviceid is actually in this user
                var deviceid = data2[deviceName];
                var cacheObj = JSON.parse(value);
                cacheObj[deviceName] = deviceid;
                var cacheString = JSON.stringify(cacheObj, null, 2);
                dbCache.put(apiKey, cacheString, function(err) {
                  if (err) {
                    console.log('put error', err);
                  } else {
                    callback(true, deviceid);
                  }
                });
              } else {
                var msg = "DeviceID not found in User";
                callback(false, msg);
              }
            } else {
              callback(false);
            }
          });
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  });
}

function convertDevIDtoDevNameArrayIntoObj(devIDtoNameMap, devObj, index, callback) {
  if (index < devIDtoNameMap.length) {
    devid = devIDtoNameMap[index].DeviceID;
    devName = devIDtoNameMap[index].DisplayName;
    devObj[devName] = devid
    convertDevIDtoDevNameArrayIntoObj(devIDtoNameMap, devObj, index + 1, callback);
  } else {
    callback(true, devObj);
  }
}

// function to add data by deviceID not using the cache
function addDataByDeviceIDInternal(deviceid, data, timestamp, callback) {
  if (!timestamp) {
    timestamp = Math.floor((new Date).getTime()/1000);
    //console.log("timestamp = " + timestamp);
  }
  if(deviceid){
    deviceManage.getVariablesFromDevice(deviceid, function(ret1, data1){
      if (ret1) {
        var variableidList = data1.Variables;
        var getItems = [];
        if(variableidList){
          batchGetItem(variableidList, getItems, function(ret2, data2){
            if(ret2){
              var varIDtoNameMap = data2.Responses["Hx.Variable"];
              console.log("data2 = " + JSON.stringify(data2, null, 2));
              var dataObj = {};
              convertDataArrToObj(data.Data, dataObj, 0, function(ret3, data3) {
                if (ret3) {
                  var varObj = {};
                  convertVarIDtoVarNameArrayIntoObj(varIDtoNameMap, varObj, 0, function(ret7, data7) {
                    if (ret7) {
                      var valueToVarIDMap = [];
                      mapValueToVarID(data3, data7, valueToVarIDMap, 0, deviceid, function(ret4, data4) {
                        if (ret4) {
                          var itemsToAddArray = [];
                          fillDataArray(data4, timestamp, itemsToAddArray, 0, function(ret5, data5) {
                            if (ret5) {
                              batchAddData(data5, function(ret6, data6) {
                                if (ret6) {
                                  callback(true);
                                } else {
                                  callback(false, data6);
                                }
                              });
                            } else {
                              callback(false);
                            }
                          });
                        } else {
                          callback(false, data4);
                        }
                      });
                    } else {
                      callback(false);
                    }
                  })
                } else {
                  callback(false);
                }
              });
            } else {
              callback(false, data2);
            }
          });
        } else {
          // Case whre there is no Variable inside the Device
          var varIDtoNameMap = [];
          var dataObj = {};
          convertDataArrToObj(data.Data, dataObj, 0, function(ret3, data3) {
            if (ret3) {
              var varObj = {};
              convertVarIDtoVarNameArrayIntoObj(varIDtoNameMap, varObj, 0, function(ret7, data7) {
                if (ret7) {
                  var valueToVarIDMap = [];
                  mapValueToVarID(data3, data7, valueToVarIDMap, 0, deviceid, function(ret4, data4) {
                    if (ret4) {
                      var itemsToAddArray = [];
                      fillDataArray(data4, timestamp, itemsToAddArray, 0, function(ret5, data5) {
                        if (ret5) {
                          batchAddData(data5, function(ret6, data6) {
                            if (ret6) {
                              callback(true);
                            } else {
                              callback(false, data6);
                            }
                          });
                        } else {
                          callback(false);
                        }
                      });
                    } else {
                      callback(false, data4);
                    }
                  });
                } else {
                  callback(false);
                }
              })
            } else {
              callback(false);
            }
          });
        }
      } else { // no Variables found in Device
        callback(false);
      }
    });
  } else {
      var msg = "DeviceID missing";
      callback(false, msg);
  }
}

// function to add data by deviceID using the cache
function addDataByDeviceIDInternal2(deviceid, data, timestamp, callback) {
  if (!timestamp) {
    timestamp = Math.floor((new Date).getTime()/1000);
  }
  if(deviceid) {
    dbCache.get(deviceid, function(err, value) {
      if (err) {
        console.log('get error', err);
        deviceManage.getVariablesFromDevice(deviceid, function(ret1, data1){
          if (ret1) {
            var variableidList = data1.Variables;
            var getItems = [];
            if(variableidList){
              batchGetItem(variableidList, getItems, function(ret2, data2){
                if(ret2){
                  var varIDtoNameMap = data2.Responses["Hx.Variable"];
                  var dataObj = {};
                  convertDataArrToObj(data.Data, dataObj, 0, function(ret3, data3) {
                    if (ret3) {
                      var varObj = {};
                      convertVarIDtoVarNameArrayIntoObj(varIDtoNameMap, varObj, 0, function(ret7, data7) {
                        if (ret7) {
                          var devCache = {};
                          converVarNametoVarIDtArrayIntoObj(varIDtoNameMap, devCache, 0, function(ret8, data8) {
                            if (ret8) {
                              var valueToVarIDMap = [];
                              var variablesNotInCache = {};
                              mapValueToVarID3(data3, data8, valueToVarIDMap, 0, deviceid, variablesNotInCache, function(ret4, data4) {
                                if (ret4) {
                                  addDataByVariableIDINternal(data4, timestamp, function(ret5, data5) {
                                    if (ret5) {
                                      callback(true);
                                    } else {
                                      if (data5 == 'NOT_FOUND') {
                                        callback(false, data5);
                                      } else {
                                        callback(false, data5);
                                      }
                                    }
                                  });
                                } else {
                                  callback(false, data4);
                                }
                              });
                            } else {
                              callback(false);
                            }
                          });
                        } else {
                          callback(false);
                        }
                      });
                    } else {
                      callback(false);
                    }
                  });
                } else {
                  callback(false, data2);
                }
              });
            } else {
              // Case where there is no Variable inside the Device
              var varIDtoNameMap = [];
              var dataObj = {};
              convertDataArrToObj(data.Data, dataObj, 0, function(ret3, data3) {
                if (ret3) {
                  var varObj = {};
                  convertVarIDtoVarNameArrayIntoObj(varIDtoNameMap, varObj, 0, function(ret7, data7) {
                    if (ret7) {
                      var valueToVarIDMap = [];
                      var variablesNotInCache = {};
                      mapValueToVarID3(data3, data7, valueToVarIDMap, 0, deviceid, variablesNotInCache, function(ret4, data4) {
                        if (ret4) {
                          addDataByVariableIDINternal(data4, timestamp, function(ret5, data5) {
                            if (ret5) {
                              callback(true);
                            } else {
                              if (data5 == 'NOT_FOUND') {
                                callback(false, data5);
                              } else {
                                callback(false, data5);
                              }
                            }
                          });
                        } else {
                          callback(false, data4);
                        }
                      });
                    } else {
                      callback(false);
                    }
                  })
                } else {
                  callback(false);
                }
              });
            }
          } else { // no Variables found in Device
            callback(false);
          }
        });
      } else {    // cache for device exist
        var obj = JSON.parse(value);
        var valueToVarIDMap = [];
        var dataObj = {};
        var variablesNotInCache = {};
        convertDataArrToObj(data.Data, dataObj, 0, function(ret3, data3) {
          if (ret3) {
            mapValueToVarID3(data3, obj, valueToVarIDMap, 0, deviceid, variablesNotInCache, function(ret4, data4) {
              if (ret4) {
                addDataByVariableIDINternal(data4, timestamp, function(ret5, data5) {
                  if (ret5) {
                    callback(true);
                  } else {
                    if (data5 == 'NOT_FOUND') {
                      callback(false, data5);
                    } else {
                      callback(false, data5);
                    }
                  }
                });
              } else {
                callback(false, data4);
              }
            });
          } else {
            callback(false);
          }
        });
      }
    });
  } else {
      var msg = "DeviceID missing";
      callback(false, msg);
  }
}

function addDataByDeviceID(req, res) {
  var deviceid = req.swagger.params.DeviceID.value;
  var dataobj = req.body;
  var data = dataobj.Data;
  var timestamp = dataobj.Timestamp;

  if(data.Data.length != 0) {
    addDataByDeviceIDInternal2(deviceid, data, timestamp, function(ret, data) {
      if (ret) {
        shareUtil.SendSuccess(res);
      } else {
        var msg = "Error: " + JSON.stringify(data, null, 2);
        shareUtil.SendInternalErr(res, msg);
      }
    });
  } else {
    var msg = "No data provided";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function mapValueToVarID(varNameToValueMap, varIDtoNameMap, valueToVarIDMap, index, deviceid, callback) {
  if (index < Object.keys(varNameToValueMap).length) {
    var varName = Object.keys(varNameToValueMap)[index];
    var varValue = varNameToValueMap[varName];
    var item = {};
    var indexOfName = Object.values(varIDtoNameMap).indexOf(varName);
    if (indexOfName > -1) {
      item.VariableID = Object.keys(varIDtoNameMap)[indexOfName];
      item.Value = varValue;
      valueToVarIDMap.push(item);
      mapValueToVarID(varNameToValueMap, varIDtoNameMap, valueToVarIDMap, index+1, deviceid, callback);
    } else {
      //create a new varid
      var uuidv1 = require('uuid/v1');
      var variableID = uuidv1();
      createNewVariableFromName(varName, variableID, deviceid, function(ret, data){
        item.VariableID = variableID;
        item.Value = varValue;
        valueToVarIDMap.push(item);
        mapValueToVarID(varNameToValueMap, varIDtoNameMap, valueToVarIDMap, index+1, deviceid, callback);
      });
    }
  } else {
    callback(true, valueToVarIDMap);
  }
}

function mapValueToVarID2(varNameToValueMap, varNametoIDMap, valueToVarIDMap, index, deviceid, callback) {
  if (index < Object.keys(varNameToValueMap).length) {
    var varName = Object.keys(varNameToValueMap)[index];
    var varValue = varNameToValueMap[varName];
    var item = {};
    if (varNametoIDMap[varName]) {
      item.VariableID = varNametoIDMap[varName];
      item.Value = varValue;
      valueToVarIDMap.push(item);
      mapValueToVarID2(varNameToValueMap, varNametoIDMap, valueToVarIDMap, index+1, deviceid, callback);
    } else {
      //create a new varid
      var uuidv1 = require('uuid/v1');
      var variableID = uuidv1();
      createNewVariableFromName(varName, variableID, deviceid, function(ret, data){
        item.VariableID = variableID;
        item.Value = varValue;
        valueToVarIDMap.push(item);
        mapValueToVarID2(varNameToValueMap, varNametoIDMap, valueToVarIDMap, index+1, deviceid, callback);
      });
    }
  } else {
    callback(true, valueToVarIDMap);
  }
}

function mapValueToVarID3(varNameToValueMap, varNametoIDMap, valueToVarIDMap, index, deviceid, variablesNotInCache, callback) {
  if (index < Object.keys(varNameToValueMap).length) {
    var varName = Object.keys(varNameToValueMap)[index];
    var varValue = varNameToValueMap[varName];
    var item = {};
    if (varNametoIDMap[varName]) {
      item.VariableID = varNametoIDMap[varName];
      item.Value = varValue;
      valueToVarIDMap.push(item);
      mapValueToVarID3(varNameToValueMap, varNametoIDMap, valueToVarIDMap, index+1, deviceid, variablesNotInCache, callback);
    } else {
      //create a new varid
      variablesNotInCache[varName] = varValue;
      mapValueToVarID3(varNameToValueMap, varNametoIDMap, valueToVarIDMap, index+1, deviceid, variablesNotInCache, callback);
    }
  } else {
    if (Object.keys(variablesNotInCache).length == 0) {
      callback(true, valueToVarIDMap);
      console.log("valueToVarIDMap = " + JSON.stringify(valueToVarIDMap, null, 2));
    } else {
      handleVariablesNotInCache(deviceid, variablesNotInCache, valueToVarIDMap, function(ret, data) {
        if (ret) {
          callback(true, valueToVarIDMap);
          console.log("valueToVarIDMap = " + JSON.stringify(valueToVarIDMap, null, 2));
        } else {
          var msg = "error while handling var no in cache";
          callback(false, msg);
        }
      });
    }
  }
}

function handleVariablesNotInCache(deviceid, variablesNotInCache, valueToVarIDMap, callback) {
  getVariableNameFromDevice(deviceid, function(ret, data) {
    if (ret) {
      if (data != null) {
        var variablesToAddToCache = {};
        var variablesToCreate = {};
        console.log("varNamefromDevice = "  + JSON.stringify(data, null, 2));
        checkIfVariablesExistInDevice(deviceid, variablesNotInCache, data, variablesToAddToCache, variablesToCreate, valueToVarIDMap, 0, function(ret, variablesToAddToCache, variablesToCreate, valueToVarIDMap) {
          if (ret) {
            if (Object.keys(variablesToAddToCache).length > 0) {
              addMultipleVarToCache(variablesToAddToCache, deviceid, 0, function(ret1, data1) {
                if (ret1) {
                  callback(true, valueToVarIDMap);
                } else {
                  callback(false);
                }
              });
            }
            if (Object.keys(variablesToCreate).length > 0) {
              createNewVariablesFromName(variablesToCreate, deviceid, valueToVarIDMap, 0, function(ret2, data2) {
                if (ret2) {
                  callback(true, valueToVarIDMap);
                } else {
                  callback(false);
                }
              });
            }
          }
        });
      } else {    //No variable in Device
        createNewVariablesFromName(variablesNotInCache, deviceid, valueToVarIDMap, 0, function(ret1, data) {
          if (ret1) {
            callback(true, valueToVarIDMap);
          } else {    // problem in creating new devices
            callback(false);
          }
        });
      }
    } else {    // did not get variables names
      callback(false);
    }
  });
}

function checkIfVariablesExistInDevice(deviceid, variablesNotInCache, varIDtoNameMap, variablesToAddToCache, variablesToCreate, valueToVarIDMap, index, callback) {
  if (index < Object.keys(variablesNotInCache).length) {
    var varName = Object.keys(variablesNotInCache)[index];
    var variableValue = variablesNotInCache[varName];
    console.log("varIDtoNameMap = "  + JSON.stringify(varIDtoNameMap, null, 2));
    if (varIDtoNameMap[varName]) {   // variable exist already in Device but wasn't in the cache
      var varid = varIDtoNameMap[varName] ;
      variablesToAddToCache[varName] = varid;
      var item = {};
      item.VariableID = varid;
      item.Value = variableValue;
      valueToVarIDMap.push(item);
      checkIfVariablesExistInDevice(deviceid, variablesNotInCache, varIDtoNameMap, variablesToAddToCache, variablesToCreate, valueToVarIDMap, index+1, callback);
    } else {
      variablesToCreate[varName] = variableValue;
      checkIfVariablesExistInDevice(deviceid, variablesNotInCache, varIDtoNameMap, variablesToAddToCache, variablesToCreate, valueToVarIDMap, index+1, callback);
    }
  } else {
    callback(true, variablesToAddToCache, variablesToCreate, valueToVarIDMap);
  }
}

function getVariableNameFromDevice(deviceid, callback) {
  deviceManage.getVariablesFromDevice(deviceid, function(ret, data){
    if (ret) {
      var variableidList = data.Variables;
      var getItems = [];
      console.log("variableidList = " + variableidList);
      if (variableidList) {
        if (variableidList.length != 0) {
          batchGetItem(variableidList, getItems, function(ret1, data1){
            if (ret1) {
              var varIDtoNameMap = data1.Responses[shareUtil.tables.variable];
              //console.log("data1 = " + JSON.stringify(data1, null, 2));
              var dataObj = {};
              convertDataArrToObj2(varIDtoNameMap, dataObj, 0, function(ret2, data2) {
                if (ret2) {
                  callback(true, dataObj);
                } else {
                  callback(false);
                }
              });
            } else {
              callback(false);
            }
          });
        } else {
          console.log("variableidList empty");
          callback(true, null);
        }
      } else {
        console.log("variableidList empty");
        callback(true, null);
      }
    } else {
      callback(false);
    }
  });
}

function addMultipleVarToCache(variablesToAddToCache, deviceid, index, callback) {
  if (index < Object.keys(variablesToAddToCache).length) {
    var varName = Object.keys(variablesToAddToCache)[index];
    var varid = variablesToAddToCache[varName];
    dbCache.get(deviceid, function(err, value) {
      if (err) {
        console.log('get error', err);
      } else {
        var cacheObj = JSON.parse(value);
        cacheObj[varName] = varid;
        var cacheString = JSON.stringify(cacheObj, null, 2);
        dbCache.put(deviceid, cacheString, function(err) {
          if (err) {
            console.log('put error', err);
            callback(false);
          } else {
            //callback(true);
            addMultipleVarToCache(variablesToAddToCache, deviceid, index+1, callback)
          }
        });
      }
    });
  } else {
    callback(true);
  }
}

function createNewVariablesFromName(variablesToCreate, deviceid, valueToVarIDMap, index, callback) {
  if (index < Object.keys(variablesToCreate).length) {
    var varName = Object.keys(variablesToCreate)[index];
    var varValue = variablesToCreate[varName];
    var uuidv1 = require('uuid/v1');
    var variableID = uuidv1();
    createNewVariableFromName(varName, variableID, deviceid, function(ret, data){
      var item = {};
      item.VariableID = variableID;
      item.Value = varValue;
      valueToVarIDMap.push(item);
      addVarToCache(deviceid, varName, variableID, function(ret1) {
        if (ret1) {
          createNewVariablesFromName(variablesToCreate, deviceid, valueToVarIDMap, index+1, callback);
        } else {
          callback(false);
        }
      });
    });
  } else {
    callback(true, valueToVarIDMap);
  }
}

function addVarToCache(deviceid, variableName, variableID, callback){
  dbCache.get(deviceid, function(err, value) {
    if (err) {
      console.log('get error', err);
      var cacheObj = {};
    } else {
      var cacheObj = JSON.parse(value);
    }
    cacheObj[variableName] = variableID;
    var cacheString = JSON.stringify(cacheObj, null, 2);
    dbCache.put(deviceid, cacheString, function(err) {
      if (err) {
        console.log('put error', err);
        callback(false);
      } else {
        callback(true);
      }
    });
  });
}

function createNewVariableFromName(varName, varID, deviceid, callback) {
  var params = {
    TableName : shareUtil.tables.variable,
    Item : {
      VariableID: varID,
      AddTimeStamp: Math.floor((new Date).getTime()/1000),
      VariableName: varName
    },
    ConditionExpression : "attribute_not_exists(VariableID)"
  };
  shareUtil.awsclient.put(params, function(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      callback(false, msg);
    } else {
        updateVariableIDInDevice(varID, deviceid, function(ret1, data1){
        if (ret1) {
          console.log("var " + varID + " created !");
          callback(true, null);
        } else {
          var msg = "Error:" + JSON.stringify(data1) + "update failed";
          callback(false, msg);
        }
      });
    }
  });
}

function convertVarIDtoVarNameArrayIntoObj(varIDtoNameMap, varObj, index, callback) {
  if (index < varIDtoNameMap.length) {
    varid = varIDtoNameMap[index].VariableID;
    varName = varIDtoNameMap[index].VariableName;
    varObj[varid] = varName;
    convertVarIDtoVarNameArrayIntoObj(varIDtoNameMap, varObj, index + 1, callback);
  } else {
    callback(true, varObj);
  }
}

function converVarNametoVarIDtArrayIntoObj(varIDtoNameMap, varObj, index, callback) {
  if (index < varIDtoNameMap.length) {
    varid = varIDtoNameMap[index].VariableID;
    varName = varIDtoNameMap[index].VariableName;
    varObj[varName] = varid;
    converVarNametoVarIDtArrayIntoObj(varIDtoNameMap, varObj, index + 1, callback);
  } else {
    callback(true, varObj);
  }
}

function convertDataArrToObj(dataArray, dataObj, index, callback) {
  if (index < dataArray.length) {
    var varName = Object.keys(dataArray[index]);
    var varid = Object.values(dataArray[index])[0];
    dataObj[varName] = varid;
    convertDataArrToObj(dataArray, dataObj, index+1, callback)
  } else {
    callback(true, dataObj);
  }
}

function convertDataArrToObj2(dataArray, dataObj, index, callback) {
  if (index < dataArray.length) {
    var key = Object.keys(dataArray[index]);
    var value2 = Object.values(dataArray[index]);
    dataObj[value2[1]] = value2[0];
    convertDataArrToObj2(dataArray, dataObj, index + 1, callback);
  } else {
    callback(true, dataObj);
  }
}

function batchGetItem(variableidList, getItems, callback) {
  fillBatchGetItem(variableidList, getItems, 0, function(ret, data) {
    if (ret) {
      var dataParams = {
        RequestItems : {
          "Hx.Variable" : {
            Keys : data,
            ProjectionExpression : "VariableID, VariableName"
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
    var getItem = {
      "VariableID" : variableidList[index]
    }
    getItems.push(getItem);
    fillBatchGetItem(variableidList, getItems, index+1, callback);
  } else {
    callback(true, getItems);
  }
}

function addSingleData(deviceid, dataobj, index, callback) {
  if (index < dataobj.Data.length) {
    var variableName = dataobj.Data[index].VariableName;
    var nameParams = {
      TableName: shareUtil.tables.variable,
      FilterExpression : "VariableName = :v1",
      ExpressionAttributeValues : {':v1' : variableName},
      ProjectionExpression : "VariableID"
    }
    shareUtil.awsclient.scan(nameParams, onScan);
    function onScan(err, data) {
      if (err) {
        var msg = "Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res, msg);
      } else {
        if (data.Count == 0) {
          var msg = "data.Count == 0"
          // have to create a new var name
          createNewVariable(deviceid, dataobj, index, function() {
            addSingleData(deviceid, dataobj, index+1, callback);
          });
        } else {
          // varName found so add Value to RawData
          var variableid = data.Items[0].VariableID;
          var timestamp = dataobj.Timestamp;
          var value = dataobj.Data[index].Value;
          var dataParams = {
            TableName : shareUtil.tables.data,
            Item : {
              VariableID : variableid,
              EpochTimeStamp : timestamp,
              Value : value
            }
          }
          shareUtil.awsclient.put(dataParams, onPut);
          function onPut(err, data) {
            if (err) {
              var msg = "Error:" + JSON.stringify(err, null, 2);
              shareUtil.SendInternalErr(res, msg);
            } else {
              //update current value in Variable table
              var updateVarParams = {
                TableName : shareUtil.tables.variable,
                Key : { VariableID: variableid },
                UpdateExpression : "set CurrentValue = :v1",
                ExpressionAttributeValues : {':v1' : value}
              }
              shareUtil.awsclient.update(updateVarParams, function(err, data) {
                if (err) {
                  var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
                  console.error(msg);
                } else {
                   //console.log("device updated!");
                   addSingleData(deviceid, dataobj, index+1, callback);
                }
              });
            }
          }
        }
      }
    }
  } else {
    return callback();
  }
}

function createNewVariable(deviceid, dataobj, index, callback) {
  var uuidv1 = require('uuid/v1');
  var crypto = require('crypto');
  var variableid = uuidv1();
  var variableName = dataobj.Data[index].VariableName;
  var timestamp = dataobj.Timestamp;
  var variableValue = dataobj.Data[index].Value;
  var params = {
    TableName : shareUtil.tables.variable,
    Item : {
      VariableID: variableid,
      AddTimeStamp: timestamp,
      VariableName: variableName,
      CurrentValue: variableValue
    },
    ConditionExpression :  "attribute_not_exists(VariableID)"
  };
  shareUtil.awsclient.put(params, onPut);
  function onPut(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    } else {
      updateVariableIDInDevice(variableid, deviceid, function(ret1, data) {
        if (ret1) {
          addRawData(variableid, timestamp, variableValue, function() {
            addSingleData(deviceid, dataobj, index, callback);
          });
        } else {
          var msg = "Error:" + JSON.stringify(data);
          shareUtil.SendInternalErr(res,msg);
        }
      });
    }
  }
}

function updateVariableIDInDevice(variableID, deviceID, callback) {
  if(!deviceID) {
    return callback(false, null);
  } else {
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
        return callback(true,null);
      }
    });
  }
}

function addRawData(variableid, timestamp, value, callback) {
  var dataParams = {
    TableName : shareUtil.tables.data,
    Item : {
      VariableID : variableid,
      EpochTimeStamp : timestamp,
      Value : value
    }
  }
  shareUtil.awsclient.put(dataParams, onPut);
  function onPut(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      console.log(msg);
    } else {
      return callback();
    }
  }
}

function getSingleDataByVariableID(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var variableID = req.swagger.params.VariableID.value;
  var dataTimeStamp = req.swagger.params.TimeStamp.value;
  var params = {
    TableName: shareUtil.tables.data,
    KeyConditionExpression : "VariableID = :v1 and EpochTimeStamp = :v2",
    ExpressionAttributeValues : {':v1' : variableID.toString(),
                                ':v2' : dataTimeStamp}
   };
  shareUtil.awsclient.query(params, function(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      console.error(msg);
      shareUtil.SendInternalErr(res,msg);
    } else {
      if (data.Count == 0) {
        var msg = "Error: Cannot find data";
        shareUtil.SendInvalidInput(res, msg);
      } else if (data.Count == 1) {
        var out_data = {'Value' : data.Items[0]["Value"]};
        shareUtil.SendSuccessWithData(res, out_data);
      } else {
        var msg = "Error: data count is not 1"
        shareUtil.SendInternalErr(res,msg);
      }
    }
  });
}

function getSingleCalculatedData(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var assetID = req.swagger.params.AssetID.value;
  var dataTimeStamp = req.swagger.params.TimeStamp.value;
  var params = {
    TableName: tables.calculatedData,
    KeyConditionExpression : "AssetID = :v1 and EpochTimeStamp = :v2",
    ExpressionAttributeValues : {':v1' : assetID.toString(),
                                ':v2' : dataTimeStamp}
  };
  docClient.query(params, function(err, data) {
  if (err) {
    var msg = "Error:" + JSON.stringify(err, null, 2);
    console.error(msg);
    shareUtil.SendInternalErr(res,msg);
  } else {
    if (data.Count == 0) {
      var msg = "Error: Cannot find data"
      shareUtil.SendInvalidInput(res,NOT_EXIST);
    } else if (data.Count == 1) {
      shareUtil.SendSuccessWithData(res, data.Items[0]);
    } else {
      var msg = "Error: data count is not 1"
      shareUtil.SendInternalErr(res,msg);
     }
    }
  });
}

function getMultipleDataByVariableID(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var variableID = req.swagger.params.VariableID.value;
  var dataTimeStampFrom = req.swagger.params.StartTimeStamp.value;
  var dataTimeStampTo = req.swagger.params.EndTimeStamp.value;
  getMultipleDataByVariableIDInternal(variableID, dataTimeStampFrom, dataTimeStampTo, function(ret, data) {
    if (ret) {
      shareUtil.SendSuccessWithData(res, data);
    } else {
      shareUtil.SendInvalidInput(res, data);
    }
  });
}

function getMultipleDataByVariableIDInternal(variableID, dataTimeStampFrom, dataTimeStampTo, callback) {
  var params = {
    TableName: shareUtil.tables.data,
    KeyConditionExpression : "VariableID = :v1 and EpochTimeStamp between :v2 and :v3",
    ExpressionAttributeValues : {':v1' : variableID.toString(),
                                ':v2' : dataTimeStampFrom,
                                ':v3' : dataTimeStampTo}
  };
  shareUtil.awsclient.query(params, function(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      console.error(msg);
      callback(false, msg);
    } else {
      if (data.Count == 0) {
        var msg = "Error: Cannot find data"
        callback(false, msg);
      } else {
        delete data["ScannedCount"];
        callback(true, data);
      }
    }
  });
}

function getMultipleCalculatedData(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var assetID = req.swagger.params.AssetID.value;
  var dataTimeStampFrom = req.swagger.params.StartTimeStamp.value;
  var dataTimeStampTo = req.swagger.params.EndTimeStamp.value;

  var params = {
    TableName: tables.calculatedData,
    KeyConditionExpression : "AssetID = :v1 and EpochTimeStamp between :v2 and :v3",
    ExpressionAttributeValues : {':v1' : assetID.toString(),
                                ':v2' : dataTimeStampFrom,
                                ':v3' : dataTimeStampTo}
  };
  docClient.query(params, function(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      console.error(msg);
      shareUtil.SendInternalErr(res,msg);
    } else {
      if (data.Count == 0) {
        var msg = "Error: Cannot find data"
        shareUtil.SendInvalidInput(res,NOT_EXIST);
      } else {
        delete data["ScannedCount"];
        shareUtil.SendSuccessWithData(res, data);
      }
    }
  });
}

function getMultipleCalculatedDataWithParameter(req, res) {
  var assetID = req.swagger.params.AssetID.value;
  var dataTimeStampFrom = req.swagger.params.StartTimeStamp.value;
  var dataTimeStampTo = req.swagger.params.EndTimeStamp.value;
  var parameterid = req.swagger.params.ParameterID.value;
  var params = {
    TableName: tables.calculatedData,
    KeyConditionExpression : "AssetID = :v1 and EpochTimeStamp between :v2 and :v3",
    ExpressionAttributeValues : {':v1' : assetID.toString(),
                                ':v2' : dataTimeStampFrom,
                                ':v3' : dataTimeStampTo
                                }
  };
  docClient.query(params, function(err, data) {
    if (err) {
      var msg = "Error:" + JSON.stringify(err, null, 2);
      console.error(msg);
      shareUtil.SendInternalErr(res,msg);
    } else {
      if (data.Count == 0) {
        var msg = "Error: Cannot find data"
        shareUtil.SendInvalidInput(res,NOT_EXIST);
      } else {
        delete data["ScannedCount"];
        var out_data = {};
        out_data['values'] = [];
        out_data['timestamp'] = [];
        out_data['parameter'] = parameterid;
        for (var i in data.Items) {
          var singleData = data.Items[i];
          for (var j in singleData.Data) {
            if (singleData.Data[j].ParamID == parameterid) {
              out_data['timestamp'].push(singleData['EpochTimeStamp']);
              out_data['values'].push(singleData.Data[j].Value);
            }
          }
          out_data['count'] = out_data['timestamp'].length;
        }
        if (out_data['count'] == 0){
          shareUtil.SendInvalidInput(res,NOT_EXIST);
        } else {
          shareUtil.SendSuccessWithData(res, out_data);
        }
      }
    }
  });
}
