import { gConstants } from '../_components/constants'

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

    return fetch(gConstants.API_ROOT + '/data/getDataByTag?AssetID=' + assetid + '&Tag=' + tag + '&Type=Temperature&StartTimeStamp=' + t1 + '&EndTimeStamp=' + t2, requestOptions)
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

export const dataServices = {
    loadSVGdata,
    getSingleTagData
};
