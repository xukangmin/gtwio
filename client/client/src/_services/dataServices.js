import SortDevices from '../Functions/sortDevices';

const getSingleTagData = (user, asset, tag, t1, t2) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };

    return fetch(process.env.API_HOST + '/data/getDataByTag?AssetID=' + asset + '&Tag=' + tag + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2, requestOptions)
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
        .then(TagData => {
            localStorage.setItem('asset(' + asset + ')', JSON.stringify(TagData));
            return SortDevices(TagData);
        });
}

const getSingleParameterData = (parameter, t1, t2) => {
    return fetch(process.env.API_HOST + '/data/getDataByParameterID?ParameterID=' + parameter + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2)
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

const getDataByAssetID = (asset, t1, t2) => {
    return fetch(process.env.API_HOST + '/data/getDataByAssetID?AssetID=' + asset + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2)
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

const getDataBySerialNumber = (serialNumber, t1, t2) => {
    return fetch(process.env.API_HOST + '/data/getDataBySerialNumber?SerialNumber=' + serialNumber + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2)
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

export const dataServices = {
    getSingleTagData,
    getSingleParameterData,
    getDataByAssetID,
    getDataBySerialNumber
};
