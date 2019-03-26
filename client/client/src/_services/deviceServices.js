import SortDevices from '../Functions/sortDevices';

const getDevices = (user, assetID) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };

    return fetch(process.env.API_HOST + '/device/getDeviceByAsset?AssetID=' + assetID, requestOptions)
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
            return SortDevices(data);
        });
}

const getDevice = (deviceID) => {
    return fetch(process.env.API_HOST + '/device/getSingleDevice?DeviceID=' + deviceID)
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

const addDevice = (user, assetID, data) => {
    let body = data;
    body.AssetID = assetID;
    body.UserID = user.UserID;

    if (data.SerialNumber != "")
    {
        Object.assign(body, data);
    }

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/device/createDevice', requestOptions)
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

const deleteDevice = (assetID, deviceID) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/device/deleteDevice?DeviceID=' + deviceID + '&AssetID=' + assetID, requestOptions)
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

const updateDevice = (data) => {

    const body = data;

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/device/updateDevice', requestOptions)
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
    getDevices,
    getDevice,
    addDevice,
    deleteDevice,
    updateDevice
};
