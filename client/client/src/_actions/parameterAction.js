import { gConstants } from '../_components/constants';
import { parameterServices } from '../_services/parameterServices';
import { alertActions } from './alertAction';
import { dataActions } from './dataAction';

const getParameterByAsset = (assetid) => {
    return dispatch => {
        dispatch(request());
        parameterServices.getParameterByAsset(assetid)
            .then(
                parameterdata => {
                    dispatch(success(parameterdata));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_PARAMETER_REQUEST } }
    function success(data) { return { type: gConstants.GET_PARAMETER_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_PARAMETER_FAILURE, error } }
}

const getSingleParameter = (pid) => {
    return dispatch => {
        dispatch(request());
        parameterServices.getSingleParameter(pid)
            .then(
                parameterdata => {
                    dispatch(success(parameterdata));

                    if (parameterdata.CurrentTimeStamp) {
                      dispatch(dataActions.getSingleParameterData(parameterdata.ParameterID, parameterdata.CurrentTimeStamp - 600000, parameterdata.CurrentTimeStamp));
                    }
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_PARAMETER_REQUEST } }
    function success(data) { return { type: gConstants.GET_PARAMETER_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_PARAMETER_FAILURE, error } }
}

const addNewParameter = (assetid, displayname, equation) => {
    return dispatch => {
        dispatch(request());
        parameterServices.addParameter(assetid, displayname, equation)
            .then(
                info => {
                    dispatch(getParameterByAsset(assetid));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.ADD_PARAMETER_REQUEST } }
    function success(data) { return { type: gConstants.ADD_PARAMETER_SUCCESS, data } }
    function failure(error) { return { type: gConstants.ADD_PARAMETER_FAILURE, error } }
}

const updateParameter = (pid, key, value) => {
    let data = {
      ParameterID: pid,
      [key]: value
    }
    return dispatch => {
        dispatch(request());
        parameterServices.updateParameter(data)
            .then(
                info => {
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.UPDATE_PARAMETER_REQUEST } }
    function success(data) { return { type: gConstants.UPDATE_PARAMETER_SUCCESS, data } }
    function failure(error) { return { type: gConstants.UPDATE_PARAMETER_FAILURE, error } }
}

const deleteParameter = (asset, parameterid) => {
    return dispatch => {
        dispatch(request());
        parameterServices.deleteParameter(asset, parameterid)
            .then(
                info => {
                    dispatch(getParameterByAsset(asset));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.DELETE_PARAMETER_REQUEST } }
    function success(data) { return { type: gConstants.DELETE_PARAMETER_REQUEST, data } }
    function failure(error) { return { type: gConstants.DELETE_PARAMETER_REQUEST, error } }
}

export const parameterActions = {
    getParameterByAsset,
    getSingleParameter,
    addNewParameter,
    updateParameter,
    deleteParameter
};
