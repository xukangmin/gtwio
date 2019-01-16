import { gConstants } from '../_components/constants';
import { dashboardServices } from '../_services/dashboardServices';
import { alertActions } from './alertAction';

const addDashboard = (assetid, dashboardData) => {
    return dispatch => {
        dispatch(request());
        dashboardServices.addAsset(assetid, dashboardData)
            .then(
                info => {
                    dispatch(success(info));
                  //  dispatch(getAssetsOverview(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_DASHBOARD_REQUEST } }
    function success(msg) { return { type: gConstants.ADD_DASHBOARD_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_DASHBOARD_FAILURE, error } }
}

const getDashboards = (assetid) => {
    return dispatch => {
        dispatch(request());
        dashboardServices.getAllDashboards(assetid)
            .then(
                dashboards => {
                    dispatch(success(dashboards));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_DASHBOARD_REQUEST } }
    function success(data) { return { type: gConstants.GET_DASHBOARD_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DASHBOARD_FAILURE, error } }
}

const getSingleDashboard = (dashboardid) => {
    return dispatch => {
        dispatch(request());
        dashboardServices.getSingleDashboard(dashboardid)
            .then(
                dashboarddata => {
                    dispatch(success(dashboarddata));
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

    function request() { return { type: gConstants.GET_DASHBOARD_REQUEST } }
    function success(data) { return { type: gConstants.GET_DASHBOARD_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DASHBOARD_FAILURE, error } }
}

const updateDashboard = (dashboarddata) => {
  return dispatch => {
    dispatch(request());
    dashboardServices.updateDashboard(dashboarddata)
        .then(
            ret => {
              dispatch(success(ret));
            },
            error => {
              dispatch(failure(error));
            }
        );
  };

  function request() { return { type: gConstants.UPDATE_DASHBOARD_REQUEST } }
  function success(data) { return { type: gConstants.UPDATE_DASHBOARD_SUCCESS, data } }
  function failure(error) { return { type: gConstants.UPDATE_DASHBOARD_FAILURE, error } }
}


export const dashboardActions = {
    addDashboard,
    getDashboards,
    getSingleDashboard,
    updateDashboard
};
