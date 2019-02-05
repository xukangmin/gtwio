import { gConstants } from '../_components/constants';
import { assetServices } from '../_services/assetServices';
import { alertActions } from './alertAction';

const addAsset = (user, displayname) => {
    return dispatch => {
        dispatch(request());
        assetServices.addAsset(user, displayname)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssetsOverview(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_ASSET_REQUEST } }
    function success(msg) { return { type: gConstants.ADD_ASSET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_ASSET_FAILURE, error } }
}

const deleteAsset = (assetid, user) => {
    return dispatch => {
        dispatch(request());
        assetServices.deleteAsset(assetid, user)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssetsOverview(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.DELETE_ASSET_REQUEST } }
    function success(msg) { return { type: gConstants.DELETE_ASSET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.DELETE_ASSET_FAILURE, error } }
}

const getAssetsOverview = (user) => {
    return dispatch => {
        dispatch(request());
        assetServices.getAssetsOverview(user)
            .then(
                assets => {
                    dispatch(success(assets));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_FAILURE, error } }
}

const getSingleAssetData = (user, assetid) => {
    return dispatch => {
        dispatch(request());
        assetServices.getSingleAsset(user, assetid)
            .then(
                assetdata => {
                    dispatch(success(assetdata));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    /*     dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => {
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );*/
    };

    function request() { return { type: gConstants.GET_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_FAILURE, error } }
}

const getAllDeviceData = (user, assetid) => {
    return dispatch => {
        dispatch(request());
        assetServices.getAllDevices(user, assetid)
            .then(
                devicedata => {
                    dispatch(success(devicedata));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    /*     dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => {
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );*/
    };

    function request() { return { type: gConstants.GET_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_FAILURE, error } }
}


export const assetActions = {
    getAssetsOverview,
    getSingleAssetData,
    addAsset,
    deleteAsset
};
