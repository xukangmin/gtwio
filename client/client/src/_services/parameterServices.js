import { gConstants } from '../_components/constants';

const getParameterByAsset = (assetid) => {

    return fetch(gConstants.API_ROOT + '/parameter/getParameterByAsset?AssetID=' + assetid)
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
        .then(parameterdata => {
            return parameterdata;
        });
}

const getSingleParameter = (pid) => {

    return fetch(gConstants.API_ROOT + '/parameter/getSingleParameter?ParameterID=' + pid)
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
        .then(parameterdata => {
            return parameterdata;
        });
}

const updateParameter = (data) => {
    const body = data;
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(gConstants.API_ROOT + '/parameter/updateParameter', requestOptions)
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

export const parameterServices = {
    getParameterByAsset,
    getSingleParameter,
    updateParameter
};
