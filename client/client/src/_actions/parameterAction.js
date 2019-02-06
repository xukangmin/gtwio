import { gConstants } from '../_components/constants';
import { parameterServices } from '../_services/parameterServices';
import { alertActions } from './alertAction';

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

export const parameterActions = {
    getParameterByAsset
};
