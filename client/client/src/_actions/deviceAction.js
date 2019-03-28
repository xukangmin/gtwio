import { gConstants } from '../Constants/constants';
import { deviceServices } from '../_services/deviceServices';
import { dataActions } from './dataAction';
import toastr from 'toastr';

const getDevices = (user, assetID) => {
    return dispatch => {
        dispatch(request());
        deviceServices.getDevices(user, assetID)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_DEVICES_REQUEST } }
    function success(data) { return { type: gConstants.GET_DEVICES_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DEVICES_FAILURE, error } }
}

const getDevice = (deviceID, t1, t2) => {
    return dispatch => {
        dispatch(request());
        deviceServices.getDevice(deviceID)
            .then(
                data => {
                    dispatch(success(data));
                    if (data.Parameters) {
                      if (data.Parameters.length === 1) {
                        dispatch(dataActions.getSingleParameterData(data.Parameters[0].ParameterID, t1, t2));
                      }
                    }
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_DEVICE_REQUEST } }
    function success(data) { return { type: gConstants.GET_DEVICE_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DEVICE_FAILURE, error } }
}

const addDevice = (user, assetID, data) => {
    return dispatch => {
        dispatch(request());
        deviceServices.addDevice(user, assetID, data)
            .then(
                info => {
                    dispatch(getDevices(user, assetID));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.ADD_DEVICE_REQUEST } }
    function success(data) { return { type: gConstants.ADD_DEVICE_SUCCESS, data } }
    function failure(error) { return { type: gConstants.ADD_DEVICE_FAILURE, error } }
}

const deleteDevice = (user, assetID, deviceID) => {
    return dispatch => {
        dispatch(request());
        deviceServices.deleteDevice(assetID, deviceID)
            .then(
                info => {
                    dispatch(getDevices(user, assetID));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.DELETE_DEVICE_REQUEST } }
    function success(data) { return { type: gConstants.DELETE_DEVICE_SUCCESS, data } }
    function failure(error) { return { type: gConstants.DELETE_DEVICE_FAILURE, error } }
}

const updateDevice = (user, assetID, data) => {
    return dispatch => {
        dispatch(request());
        deviceServices.updateDevice(data)
            .then(
                info => {
                    dispatch(getDevices(user, assetID));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.UPDATE_DEVICE_REQUEST } }
    function success(data) { toastr.success("Device Updated"); return { type: gConstants.UPDATE_DEVICE_SUCCESS, data } }
    function failure(error) { return { type: gConstants.UPDATE_DEVICE_FAILURE, error } }
}

export const deviceActions = {
    getDevices,
    getDevice,
    addDevice,
    deleteDevice,
    updateDevice
};
