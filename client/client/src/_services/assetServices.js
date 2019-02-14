import { gConstants } from '../_components/constants';
import { dataServices } from './dataServices';
import { parameterServices } from './parameterServices';

const getAssetsOverview = (user) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey},
        method: 'GET'
    };

    return fetch(gConstants.API_ROOT + '/asset/getAssetByUser?userID=' + user.UserID, requestOptions)
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
        .then(assetData => {
            localStorage.setItem('assets', JSON.stringify(assetData));
            return assetData;
        });
}

const _getSingleParameterCurrentValue = (dataobj) => {
  return new Promise(
    (resolve, reject) => {
      if (dataobj.ParameterID == "N/A" || dataobj.ParameterID == "None" || dataobj.ParameterID == "Null")
      {
        dataobj.Value = "N/A";
        resolve(dataobj);
      } else {
        parameterServices.getSingleParameter(dataobj.ParameterID)
          .then(ret => {
              dataobj.Value  = ret.CurrentValue;
              dataobj.Unit = ret.Unit;
              resolve(dataobj);
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

const getDataByTagList = (taglist) => {
  return Promise.all(taglist.map(_getSingleTag))
    .then(
      ret => {
        return ret;
      }
    )
}


const getSingleAsset = (user, assetid) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };

    return fetch(gConstants.API_ROOT + '/asset/getSingleAsset?AssetID=' + assetid, requestOptions)
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
        .then(assetData => {
            localStorage.setItem('asset(' + assetid + ')', JSON.stringify(assetData));
            return assetData;
        });
}

const addAsset = (user, displayname) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'x-api-key' : user.ApiKey },
        body: JSON.stringify({
            'UserID': user.UserID,
            'DisplayName': displayname
        })
    };

    return fetch(gConstants.API_ROOT + '/asset/createAsset', requestOptions)
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
    .then(assetData => {
        return assetData;
    });
}

const deleteAsset = (assetid, user) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(gConstants.API_ROOT + '/asset/deleteAsset?AssetID=' + assetid + '&UserID=' + user.UserID, requestOptions)
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
    getAssetsOverview,
    getSingleAsset,
    addAsset,
    deleteAsset,
    getDataByTagList
};
