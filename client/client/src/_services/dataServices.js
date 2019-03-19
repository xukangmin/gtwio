import { gConstants } from '../_components/constants';
import SortDevices from '../_components/SortDevices';

const loadSVGdata = (svgname) => {
    const requestOptions = {
        headers: { 'Access-Control-Allow-Origin': '*'}
    };
    return fetch('https://s3.amazonaws.com/gtwiiotres/HeatExchanger.svg',requestOptions)
        .then(response => {
            console.log(response);
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        })
        .then(svgData => {
            localStorage.setItem('asset(' + assetid + ')', JSON.stringify(svgData));
            return svgData;
        });
}

const getSingleTagData = (user, assetid, tag, t1, t2) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' ,
                   'x-api-key' : user.ApiKey}
    };

    return fetch(process.env.API_HOST + '/data/getDataByTag?AssetID=' + assetid + '&Tag=' + tag + '&Type=Temperature&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2, requestOptions)
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
            localStorage.setItem('asset(' + assetid + ')', JSON.stringify(TagData));
            return SortDevices(TagData);
        });
}

const getSingleParameterData = (pid, t1, t2) => {
    return fetch(process.env.API_HOST + '/data/getDataByParameterID?ParameterID=' + pid + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2)
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

const getDataByAssetID = (assetid, t1, t2) => {
    return fetch(process.env.API_HOST + '/data/getDataByAssetID?AssetID=' + assetid + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2)
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

const getDataBySerialNumber = (serialnumber, t1, t2) => {
    return fetch(process.env.API_HOST + '/data/getDataBySerialNumber?SerialNumber=' + serialnumber + '&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2)
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
    loadSVGdata,
    getSingleTagData,
    getSingleParameterData,
    getDataByAssetID,
    getDataBySerialNumber
};
