import { gConstants } from '../_components/constants';
import { assetServices } from '../_services/assetServices';

const addAsset = (user, displayName, location) => {
    return dispatch => {
        dispatch(request());
        assetServices.addAsset(user, displayName, location)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssetsOverview(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_ASSET_REQUEST } }
    function success(msg) { return { type: gConstants.ADD_ASSET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_ASSET_FAILURE, error } }
}

const createAssetByConfig = (user, config) => {
    return dispatch => {
        dispatch(request());
        assetServices.createAssetByConfig(user, config)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssetsOverview(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_ASSET_BY_CONFIG_REQUEST } }
    function success(msg) { return { type: gConstants.ADD_ASSET_BY_CONFIG_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_ASSET_BY_CONFIG_FAILURE, error } }
}

const deleteAsset = (asset, user) => {
    return dispatch => {
        dispatch(request());
        assetServices.deleteAsset(asset, user)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssetsOverview(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.DELETE_ASSET_REQUEST } }
    function success(msg) { return { type: gConstants.DELETE_ASSET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.DELETE_ASSET_FAILURE, error } }
}

const getAssetsOverview = (user) => {
    return dispatch => {
        dispatch(request());
        assetServices.getAssetsOverview(user)
            .then(
                assets => {
                    dispatch(success(assets));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_ASSETS_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSETS_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSETS_FAILURE, error } }
}

const getSingleAssetDetail = (user, asset) => {
    return dispatch => {
      dispatch(request());
      assetServices.getSingleAsset(user, asset)
        .then(
          data => {
            dispatch(success(data));
            if (data.Settings) {
              if (data.Settings.Tags) {
                assetServices.getDataByTagList(data.Settings.Tags)
                  .then(
                    tags => {
                      dispatch(success_tag(tags));
                    },
                    error => {
                      dispatch(failure(error));
                    }
                  );
              }
            }
          },
          error => {
            dispatch(failure(error));
          }
        )
    };

    function request() { return { type: gConstants.GET_SINGLE_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_SINGLE_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_SINGLE_ASSET_FAILURE, error } }
    function success_tag(data) { return {type: gConstants.GET_SINGLE_ASSET_TAG_SUCCESS, data } }
}

const getSingleAssetData = (user, asset) => {
    return dispatch => {
        dispatch(request());
        assetServices.getSingleAsset(user, asset)
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

const getAllDeviceData = (user, asset) => {
    return dispatch => {
        dispatch(request());
        assetServices.getAllDevices(user, asset)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_ASSET_DEVICE_DATA_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_DEVICE_DATA_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_DEVICE_DATA_FAILURE, error } }
}

const updateAsset = (user, asset, key, value) => {
  return dispatch => {
        dispatch(request());
        assetServices.updateAsset(asset, key, value)
            .then(
                info => {
                    dispatch(getAssetsOverview(user));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.UPDATE_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.UPDATE_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.UPDATE_ASSET_FAILURE, error } }
}

export const assetActions = {
    getAssetsOverview,
    getSingleAssetData,
    addAsset,
    createAssetByConfig,
    deleteAsset,
    getSingleAssetDetail,
    getAllDeviceData,
    updateAsset
};
