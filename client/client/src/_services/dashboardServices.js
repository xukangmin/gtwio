

import { gConstants } from '../_components/constants'


const getAllDashboards = (assetid) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json'}
    };

    return fetch(process.env.API_HOST + '/dashboard/getDashboardByAsset?AssetID=' + assetid, requestOptions)
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
        .then(dashboardData => {
            return dashboardData;
        });
}

const getSingleDashboard = (dashboardid) => {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json'}
    };

    return fetch(process.env.API_HOST + '/dashboard/getDashboardByAsset?DashboardID=' + dashboardid, requestOptions)
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
        .then(dashboardData => {
            return dashboardData;
        });
}


const updateDashboard = (dashboarddata) => {

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(dashboarddata)
    };



    return fetch(process.env.API_HOST + '/dashboard/updateDashboard', requestOptions)
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
    .then(dashboardData => {
        return dashboardData;
    });
}


const addNewDashboard = (assetid, dashboarddata) => {

    const body = {
        'AssetID': assetid,
        'DisplayName': dashboarddata.DisplayName,
    };

    if (dashboarddata.Widgets)
    {
        Object.assign(body, dashboarddata);
    }

    console.log("body: ");
    console.log(body);

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'
                 },
        body: JSON.stringify(body)
    };



    return fetch(process.env.API_HOST + '/dashboard/createDashboard', requestOptions)
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
    .then(dashboardData => {
        return dashboardData;
    });
}

const deleteDashboard = (assetid, dashboardid) => {

    const requestOptions = {
        method: 'DELETE'
    };

    return fetch(process.env.API_HOST + '/dashboard/deleteDashboard?DashboardID=' + dashboardid + '&AssetID=' + assetid, requestOptions)
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

export const dashboardServices = {
    addNewDashboard,
    deleteDashboard,
    getAllDashboards,
    updateDashboard
};
