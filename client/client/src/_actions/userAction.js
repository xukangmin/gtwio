import { gConstants } from '../_components/constants';
import { userService } from '../_services/userServices';
import { alertActions } from './alertAction';

export const userActions = {
    login,
    logout,
    register,
    activate,
    reset,
    resetPassword
};

function login(username, password, history) {
    return dispatch => {
        dispatch(request({ username }));

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
            );
    };

    function request(user) { return { type: gConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: gConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: gConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userService.logout();
    return { type: gConstants.LOGOUT };
}

function register(email, password) {
    return dispatch => {
        dispatch(request({ email }));

        userService.register(email, password)
            .then(
                user => {
                    dispatch(success(user));
                    dispatch(alertActions.info('Please follow the link in your email to complete registration'));
                    //Send activiation email here
                    //dispatch(alertActions.success('Registration successful'));
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(user) { return { type: gConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: gConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: gConstants.REGISTER_FAILURE, error } }
}


function activate(id, code){
    return dispatch => {
        
        userService.activate(id, code)
            .then(
                user => {
                    dispatch(alertActions.info(user.message));
                },
                error => {
                   // dispatch(failure(error));
                    dispatch(alertActions.info(error));
                }
            )
    };
}


function reset(email) {
    return dispatch => {
        dispatch(request({ email }));

        userService.reset(email)
            .then(
                msg => { 
                    dispatch(alertActions.info(msg.message));
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(email) { return { type: gConstants.RESET_REQUEST, email } }
    function success(msg) { return { type: gConstants.RESET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.RESET_FAILURE, error } }
}

function resetPassword(email, password) {
    return dispatch => {
        dispatch(request({ email }));

        userService.resetPassword(email, password)
            .then(
                msg => { 
                    dispatch(alertActions.info(msg.message));
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(email) { return { type: gConstants.RESET_REQUEST, email } }
    function success(msg) { return { type: gConstants.RESET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.RESET_FAILURE, error } }
}