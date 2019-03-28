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

const _getSingleTag = (tag) => {
  return new Promise(
    (resolve, reject) => {
      Promise.all(tag.Data.map(_getSingleParameterCurrentValue))
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
  return Promise.all(tagList.map(_getSingleTag))
    .then(
      ret => {
        return ret;
      }
    )
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

const getConfigByAssetID = (user, assetID) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };
    return fetch(process.env.API_HOST + '/asset/getConfigByAssetID?AssetID=' + assetID, requestOptions)
        .then(response => {
            response.json().then((body) => {
                let blob = new Blob([JSON.stringify(body, null, 2)], {type : 'application/json'});
                console.log(body);
                
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

export const assetServices = {
    getAssets,
    getAsset,
    getConfigByAssetID,
    getDataByTagList,
    addAsset,
    addAssetByConfig,
    addAssetByConfigFile,
    deleteAsset,
    updateAsset
};
