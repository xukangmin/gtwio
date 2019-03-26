import { gConstants } from '../Constants/constants';
import { parameterServices } from '../_services/parameterServices';
import { dataActions } from './dataAction';

const getParameters = (assetID) => {
    return dispatch => {
        dispatch(request());
        parameterServices.getParameters(assetID)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_PARAMETERS_REQUEST } }
    function success(data) { return { type: gConstants.GET_PARAMETERS_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_PARAMETERS_FAILURE, error } }
}

const getParameter = (parameterID) => {
    return dispatch => {
        dispatch(request());
        parameterServices.getParameter(parameterID)
            .then(
                data => {
                    dispatch(success(data));

                    if (data.CurrentTimeStamp) {
                      dispatch(dataActions.getSingleParameterData(data.ParameterID, data.CurrentTimeStamp - 600000, data.CurrentTimeStamp));
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

const addParameter = (assetID, data) => {
    return dispatch => {
        dispatch(request());
        parameterServices.addParameter(assetID, data)
            .then(
                info => {
                    dispatch(getParameters(assetID));
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

const updateParameter = (user, assetID, data) => {
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

const deleteParameter = (asset, parameterID) => {
    return dispatch => {
        dispatch(request());
        parameterServices.deleteParameter(asset, parameterID)
            .then(
                info => {
                    dispatch(getParameters(asset));
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
    getParameters,
    getParameter,
    addParameter,
    updateParameter,
    deleteParameter
};
