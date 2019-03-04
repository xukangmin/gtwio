import { gConstants } from '../_components/constants'
import SortDevices from '../_components/SortDevices';

const getAllDevices = (user, assetid) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };

    return fetch(process.env.API_HOST + '/device/getDeviceByAsset?AssetID=' + assetid, requestOptions)
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

    return fetch(process.env.API_HOST + '/device/getSingleDevice?DeviceID=' + deviceid)
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
    console.log(devicedata.DisplayName)
    const body = {
        'AssetID': assetid,
        'UserID': user.UserID,
        'DisplayName': devicedata.DisplayName,
        'SerialNumber': devicedata.SerialNumber
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
    .then(deviceData => {
        return deviceData;
    });
}

const deleteDevice = (assetid, deviceid) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/device/deleteDevice?DeviceID=' + deviceid + '&AssetID=' + assetid, requestOptions)
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
    addNewDevice,
    deleteDevice,
    getAllDevices,
    getSingleDevice,
    updateDevice
};
