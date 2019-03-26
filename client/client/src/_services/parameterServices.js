const getParameters = (assetID) => {

    return fetch(process.env.API_HOST + '/parameter/getParameterByAsset?AssetID=' + assetID)
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

const getParameter = (parameterID) => {
    return fetch(process.env.API_HOST + '/parameter/getSingleParameter?ParameterID=' + parameterID)
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

const addParameter = (assetID, displayName, equation) => {
    const body = {
        'AssetID': assetID,
        'DisplayName': displayName,
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
    .then(data => {
        return data;
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

const deleteParameter = (assetID, parameterID) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/parameter/deleteParameter?AssetID=' + assetID + '&ParameterID=' + parameterID, requestOptions)
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
    getParameters,
    getParameter,
    addParameter,
    updateParameter,
    deleteParameter
};
