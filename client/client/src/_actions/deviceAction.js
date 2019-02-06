import { gConstants } from '../_components/constants';
import { deviceServices } from '../_services/deviceServices';
import { alertActions } from './alertAction';

const getAllDeviceData = (user, assetid) => {
    return dispatch => {
        dispatch(request());
        deviceServices.getAllDevices(user, assetid)
            .then(
                devicedata => {
                    dispatch(success(devicedata));
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

const getSingleDeviceData = (deviceid) => {
    return dispatch => {
        dispatch(request());
        deviceServices.getSingleDevice(deviceid)
            .then(
                devicedata => {
                    dispatch(success(devicedata));
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

const addNewDevice = (user, assetid, devicedata) => {
    return dispatch => {
        dispatch(request());
        deviceServices.addNewDevice(user, assetid, devicedata)
            .then(
                info => {
                    dispatch(getAllDeviceData(user, assetid));
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

const deleteDevice = (user, assetid, deviceid) => {
    return dispatch => {
        dispatch(request());
        deviceServices.deleteDevice(assetid, deviceid)
            .then(
                info => {
                    dispatch(getAllDeviceData(user, assetid));
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

const updateDevice = (user, assetid, data) => {
    return dispatch => {
        dispatch(request());
        deviceServices.updateDevice(data)
            .then(
                info => {
                    dispatch(getAllDeviceData(user, assetid));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.UPDATE_DEVICE_REQUEST } }
    function success(data) { return { type: gConstants.UPDATE_DEVICE_SUCCESS, data } }
    function failure(error) { return { type: gConstants.UPDATE_DEVICE_FAILURE, error } }
}

export const deviceActions = {
    addNewDevice,
    deleteDevice,
    getAllDeviceData,
    getSingleDeviceData,
    updateDevice
};
