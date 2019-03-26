import { gConstants } from '../Constants/constants';

export const alertActions = {
    success,
    error,
    clear,
    info
};

function success(message) {
    return { type: gConstants.SUCCESS, message };
}

function error(message) {
    return { type: gConstants.ERROR, message };
}

function clear() {
    return { type: gConstants.CLEAR };
}

function info(message) {
    return { type: gConstants.INFO, message };
}