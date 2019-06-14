import { gConstants } from '../Constants/constants';
import { dataServices } from '../_services/dataServices';

const getSingleTagData = (user, asset, tag, t1, t2) => {
    return dispatch => {
        dispatch(request());
        dataServices.getSingleTagData(user, asset, tag, t1, t2)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_TAG_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_TAG_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_TAG_DATA_FAILURE, error } }
}

const getSingleParameterData = (parameter, t1, t2) => {
    return dispatch => {
        dispatch(request());
        dataServices.getSingleParameterData(parameter, t1, t2)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_PARAMETER_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_PARAMETER_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_PARAMETER_DATA_FAILURE, error } }
}

const getDataByAssetID = (asset, t1, t2) => {
    return dispatch => {
        dispatch(request());
        
        

            
        dataServices.getDataByAssetID(asset, t1, t2)

        .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_ASSET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_DATA_FAILURE, error } }
}

const getDataBySerialNumber = (serialNumber, t1, t2) => {
    return dispatch => {
        dispatch(request());
        dataServices.getDataBySerialNumber(serialNumber, t1, t2)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };
    function request() { return { type: gConstants.GET_SERIAL_NUMBER_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_SERIAL_NUMBER_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_SERIAL_NUMBER_DATA_FAILURE, error } }
}

const getDataForBaselineSelection = (assetID) => {
    return dispatch => {
      dispatch(request());
      dataServices.getDataForBaselineSelection(assetID)
        .then(
          data => {
            dispatch(success(data));
          },
          error => {
            dispatch(failure(error));
          }
        )
    };

    function request() { return { type: gConstants.GET_DATA_FOR_BASELINE_SELECTION_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_FOR_BASELINE_SELECTION_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FOR_BASELINE_SELECTION_FAILURE, error } }
}

export const dataActions = {
    getSingleTagData,
    getSingleParameterData,
    getDataByAssetID,
    getDataBySerialNumber,
    getDataForBaselineSelection
};
