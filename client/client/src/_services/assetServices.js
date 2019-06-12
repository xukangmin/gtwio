import { parameterServices } from './parameterServices';
import { saveAs } from 'file-saver';

const getAssets = (user) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey},
        method: 'GET'
    };
    return fetch(process.env.API_HOST + '/asset/getAssetByUser?userID=' + user.UserID, requestOptions)
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
        .then(data => {
            localStorage.setItem('assets', JSON.stringify(data));
            return data;
        });
}

const _getSingleParameterCurrentValue = (dataObj) => {
    return new Promise(
      (resolve, reject) => {
        if (dataObj.ParameterID == "N/A" || dataObj.ParameterID == "None" || dataObj.ParameterID == "Null")
        {
          dataObj.Value = "N/A";
          resolve(dataObj);
        } else {
          parameterServices.getParameter(dataObj.ParameterID)
            .then(ret => {
              dataObj.Value  = ret.CurrentValue;
              dataObj.Unit = ret.Unit;
              if (ret.Range)
              {
                  dataObj.Range = ret.Range;
              }
              
              resolve(dataObj);
            })
            .catch(
              err => {
                reject(err);
              }
            );
        }
      });
  }

const _getAllParameterCurrentValue = (tagdata) => {
  return new Promise(
    (resolve, reject) => {
        if (tagdata.ParameterList.length > 0) {
            Promise.all(tagdata.ParameterList.map(_getSingleParameterCurrentValue))
                .then(
                    ret => {
                        tagdata.ParameterList = ret;
                        resolve(tagdata);
                    }
                )
                .catch(
                    err => {
                        reject(err);
                    }
                );
        } else {
            resolve([]);
        }
    });
}

const _getSingleTag = (tag) => {
  return new Promise(
    (resolve, reject) => {
      Promise.all(tag.Data.map(_getAllParameterCurrentValue))
        .then(
          ret => {
            tag.Data = ret;
            resolve(tag);
          }
        )
        .catch(
          err => {
            reject(err);
          }
        )
    });
}

const getDataByTagList = (tagList) => {    
  return Promise.all(tagList.map(_getSingleTag));
}

const getAsset = (user, assetID) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };
    return fetch(process.env.API_HOST + '/asset/getSingleAsset?AssetID=' + assetID, requestOptions)
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
        .then(data => {
            localStorage.setItem('asset(' + assetID + ')', JSON.stringify(data));
            return data;
        });
}

const getAssetConfig = (assetID) => {    
    return fetch(process.env.API_HOST + '/asset/getAssetConfig?AssetID=' + assetID)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        });
}

const updateAssetConfig = (assetID, data) => {

    let body = {
      AssetID: assetID,
      Config: data
    };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'
                },
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/asset/updateAssetConfig', requestOptions)
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
    .then(info => {
        return info;
    });
}

const getConfigByAssetID = (user, assetID) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };
    return fetch(process.env.API_HOST + '/asset/getConfigByAssetID?AssetID=' + assetID, requestOptions)
        .then(response => {
            response.json().then((body) => {
                let blob = new Blob([JSON.stringify(body, null, 2)], {type : 'application/json'});                
                saveAs(blob, body[0].AssetName.toString() + '.json');
            });
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        });
}

const getTimeRangeByAsset = (assetID) => {    
    return fetch(process.env.API_HOST + '/asset/getAssetTimeRange?AssetID=' + assetID)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        });
}

const addAsset = (user, displayName, location) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'x-api-key' : user.ApiKey },
        body: JSON.stringify({
            'UserID': user.UserID,
            'DisplayName': displayName,
            'Location': location
        })
    };

    return fetch(process.env.API_HOST + '/asset/createAsset', requestOptions)
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
    .then(data => {
        return data;
    });
}

const addAssetByConfig = (user, config) => {
    let data = {
      'UserID': user.UserID,
      'Config': [config]
    };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'x-api-key' : user.ApiKey },
        body: JSON.stringify(data)
    };
    return fetch(process.env.API_HOST + '/asset/createAssetByConfig', requestOptions)
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
    .then(data => {
        return data;
    });
}

const addAssetByConfigFile = (file) => {
    const requestOptions = {
        method: 'POST',
        body: file
    };
    return fetch(process.env.API_HOST + '/asset/createAssetByConfigFile', requestOptions)
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
    .then(data => {
        return data;
    });
}


const deleteAsset = (assetID, user) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/asset/deleteAsset?AssetID=' + assetID + '&UserID=' + user.UserID, requestOptions)
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
    .then(info => {
        return info;
    });
}

const updateAsset = (assetID, key, value) => {

    let body = {
      AssetID: assetID,
      [key]: value
    };
    console.log(body);
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/asset/updateAsset', requestOptions)
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
    .then(info => {
        return info;
    });
}

const getBaselines = (user, assetID) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey},
        method: 'GET'
    };
    return fetch(process.env.API_HOST + '/asset/getBaselineByAssetID?AssetID=' + assetID, requestOptions)
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
        .then(data => {
            localStorage.setItem('assets', JSON.stringify(data));
            return data;
        });
}

const addBaseline = (user, assetID, timestamp) => {
    let data = {
      'AssetID': assetID,
      'TimeStamp': timestamp
    };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'x-api-key' : user.ApiKey },
        body: JSON.stringify(data)
    };
    return fetch(process.env.API_HOST + '/asset/addBaselineByAssetID', requestOptions)
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
    .then(data => {
        return data;
    });
}

const deleteBaseline = (user, assetID, timestamp) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/asset/deleteBaselineByAssetID?AssetID=' + assetID + '&TimeStamp=' + timestamp, requestOptions)
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
    .then(info => {
        return info;
    });
}

const updateBaseline = (assetID, data) => {
    let body = {
      AssetID: assetID,
      Baselines: data
    };
    console.log(body);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/asset/updateBaseline', requestOptions)
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
    .then(info => {
        return info;
    });
}

const getTimeIntervals = (assetID) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json'},
        method: 'GET'
    };
    return fetch(process.env.API_HOST + '/asset/getAllTimeInterval?AssetID=' + assetID, requestOptions)
    .then(response => {
        return Promise.all([response, response.json()])
    })
    .then( ([resRaw, resJSON]) => {
        if (!resRaw.ok)
        {
            return Promise.reject(resJSON.message);
        }
        return resJSON;
    });
}

const addTimeInterval = (assetID, interval) => {
    let data = {
        AssetID: assetID,
        Interval: interval
    }
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };
    return fetch(process.env.API_HOST + '/asset/createAllEquationWithInterval', requestOptions)
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
    .then(data => {
        return data;
    });
}

const deleteTimeInterval = (assetID, interval) => {

    let body = {
        AssetID: assetID,
        Interval: interval
    };
      console.log(body);
      const requestOptions = {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json'
                   },
          body: JSON.stringify(body)
      };

    return fetch(process.env.API_HOST + '/asset/deleteAllEquationWithInterval', requestOptions)
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
    .then(info => {
        return info;
    });
}

const setTimerIntervalActiveForTag = (assetID, tagName, assignedTag, interval) => {
    let body = {
      AssetID: assetID,
      TagName: tagName,
      AssignedTag: assignedTag,
      Interval: interval
    };
    console.log(body);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/asset/setTimerIntervalActiveForTag', requestOptions)
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
    .then(info => {
        return info;
    });
}

export const assetServices = {
    getAssets,
    getAsset,
    getAssetConfig,
    updateAssetConfig, 
    getConfigByAssetID,
    getDataByTagList,
    addAsset,
    addAssetByConfig,
    addAssetByConfigFile,
    getTimeRangeByAsset,
    deleteAsset,
    updateAsset,
    getBaselines,
    addBaseline,
    deleteBaseline,
    updateBaseline,
    getTimeIntervals,
    addTimeInterval,
    deleteTimeInterval,
    setTimerIntervalActiveForTag
};
