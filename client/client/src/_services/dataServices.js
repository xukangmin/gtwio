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


export const dataServices = {
    loadSVGdata
};