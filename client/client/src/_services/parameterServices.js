import { gConstants } from '../_components/constants';

const getParameterByAsset = (assetid) => {

    return fetch(process.env.API_HOST + '/parameter/getParameterByAsset?AssetID=' + assetid)
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

    return fetch(process.env.API_HOST + '/parameter/getSingleParameter?ParameterID=' + pid)
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

const addParameter = (assetid, displayname, equation) => {
    const body = {
        'AssetID': assetid,
        'DisplayName': displayname,
        'Equation': equation
    };

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };

    return fetch(process.env.API_HOST + '/parameter/createParameter', requestOptions)
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
    console.log(requestOptions);
    return fetch(process.env.API_HOST + '/parameter/updateParameter', requestOptions)
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

const deleteParameter = (assetid, parameterid) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/parameter/deleteParameter?AssetID=' + assetid + '&ParameterID=' + parameterid, requestOptions)
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
    addParameter,
    updateParameter,
    deleteParameter
};
