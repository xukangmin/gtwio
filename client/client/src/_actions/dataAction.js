import { gConstants } from '../_components/constants';
import { dataServices } from '../_services/dataServices';
import { alertActions } from './alertAction';

const loadSVGdata = (svgname) => {
    return dispatch => {
        dispatch(request());
        dataServices.loadSVGdata(svgname)
            .then(
                svgdata => {
                    dispatch(success(svgdata));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FAILURE, error } }
}

const getSingleTagData = (user, asset, tag, t1, t2) => {
  console.log(t1+' '+t2)
    return dispatch => {
        dispatch(request());
        dataServices.getSingleTagData(user, asset, tag, t1, t2)
            .then(
                tagData => {
                    dispatch(success(tagData));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FAILURE, error } }
}

const getSingleParameterData = (pid, t1, t2) => {
    return dispatch => {
        dispatch(request());
        dataServices.getSingleParameterData(pid, t1, t2)
            .then(
                parameterData => {
                    dispatch(success(parameterData));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FAILURE, error } }
}

const getDataByAssetID = (asset, t1, t2) => {
    return dispatch => {
        dispatch(request());
        dataServices.getDataByAssetID(asset, t1, t2)
            .then(
                assetData => {
                    dispatch(success(assetData));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FAILURE, error } }
}

const getDataBySerialNumber = (serialnumber, t1, t2) => {
    return dispatch => {
        dispatch(request());
        dataServices.getDataBySerialNumber(serialnumber, t1, t2)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FAILURE, error } }
}

export const dataActions = {
    loadSVGdata,
    getSingleTagData,
    getSingleParameterData,
    getDataByAssetID,
    getDataBySerialNumber
};
