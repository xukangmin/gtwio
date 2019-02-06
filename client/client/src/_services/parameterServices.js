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

export const parameterServices = {
    getParameterByAsset
};
