import { gConstants } from '../_components/constants'
import SortDevices from '../_components/SortDevices';

const getAllDevices = (user, assetid) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };

    return fetch(gConstants.API_ROOT + '/device/getDeviceByAsset?AssetID=' + assetid, requestOptions)
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
        .then(deviceData => {
            return SortDevices(deviceData);
        });
}

const getSingleDevice = (deviceid) => {

    return fetch(gConstants.API_ROOT + '/device/getSingleDevice?DeviceID=' + deviceid)
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
        .then(deviceData => {
            return deviceData;
        });
}

const addNewDevice = (user, assetid, devicedata) => {

    const body = {
        'AssetID': assetid,
        'UserID': user.UserID,
        'DisplayName': devicedata.DisplayName
    };

    if (devicedata.SerialNumber != "")
    {
        Object.assign(body, devicedata);
    }

    console.log("body: ");
    console.log(body);

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(gConstants.API_ROOT + '/device/createDevice', requestOptions)
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

const deleteDevice = (assetid, deviceid) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(gConstants.API_ROOT + '/device/deleteDevice?DeviceID=' + deviceid + '&AssetID=' + assetid, requestOptions)
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

const updateDeviceTag = (deviceid, data) => {

    const body = {
        'DeviceID': deviceid,
        'Tag': data
    };

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(gConstants.API_ROOT + '/device/updateDevice', requestOptions)
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

export const deviceServices = {
    addNewDevice,
    deleteDevice,
    getAllDevices,
    getSingleDevice,
    updateDeviceTag
};
