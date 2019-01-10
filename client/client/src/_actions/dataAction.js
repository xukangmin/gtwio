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

    function request() { return { type: gConstants.GET_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DATA_FAILURE, error } }
}


export const dataActions = {
    loadSVGdata
};