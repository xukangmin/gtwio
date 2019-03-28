import { gConstants } from '../Constants/constants';
import { assetServices } from '../_services/assetServices';
import toastr from 'toastr';

const getAssets = (user) => {
    return dispatch => {
        dispatch(request());
        assetServices.getAssets(user)
            .then(
                data => {
                    dispatch(success(data));
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

const getAsset = (user, assetID) => {
    return dispatch => {
      dispatch(request());
      assetServices.getAsset(user, assetID)
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

    function request() { return { type: gConstants.GET_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_FAILURE, error } }
    function success_tag(data) { return {type: gConstants.GET_ASSET_SUCCESS, data } }
}

const getConfigByAssetID = (user, assetID) => {
    return dispatch => {
      dispatch(request());
      assetServices.getConfigByAssetID(user, assetID)
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

    function request() { return { type: gConstants.GET_CONFIG_BY_ASSET_ID_REQUEST } }
    function success(data) { toastr.success("Config File Downloaded"); return { type: gConstants.GET_CONFIG_BY_ASSET_ID_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_CONFIG_BY_ASSET_ID_FAILURE, error } }
    function success_tag(data) { return {type: gConstants.GET_CONFIG_BY_ASSET_ID__SUCCESS, data } }
}

const getDevicesByAsset = (user, assetID) => {
    return dispatch => {
        dispatch(request());
        assetServices.getDevicesByAsset(user, assetID)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_DEVICES_BY_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_DEVICES_BY_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_DEVICES_BY_ASSET_FAILURE, error } }
}

const addAsset = (user, displayName, location) => {
    return dispatch => {
        dispatch(request());
        assetServices.addAsset(user, displayName, location)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssets(user));
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

const addAssetByConfig = (user, config) => {
    console.log(config)
    return dispatch => {
        dispatch(request());
        assetServices.addAssetByConfig(user, config)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssets(user));
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

const addAssetByConfigFile = (user, file) => {
    return dispatch => {
        dispatch(request());
        assetServices.addAssetByConfigFile(file)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssets(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_ASSET_BY_CONFIG_FILE_REQUEST } }
    function success(msg) { return { type: gConstants.ADD_ASSET_BY_CONFIG_FILE_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_ASSET_BY_CONFIG_FILE_FAILURE, error } }
}

const deleteAsset = (assetID, user) => {
    return dispatch => {
        dispatch(request());
        assetServices.deleteAsset(assetID, user)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getAssets(user));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.DELETE_ASSET_REQUEST } }
    function success(msg) { 
        console.log('success')
        toastr.success("Equation updated."); 
        return { type: gConstants.DELETE_ASSET_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.DELETE_ASSET_FAILURE, error } }
}

const updateAsset = (user, assetID, key, value) => {
  return dispatch => {
        dispatch(request());
        assetServices.updateAsset(assetID, key, value)
            .then(
                info => {
                    dispatch(getAssets(user));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.UPDATE_ASSET_REQUEST } }
    function success(data) { toastr.success("Asset Updated"); return { type: gConstants.UPDATE_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.UPDATE_ASSET_FAILURE, error } }
}

export const assetActions = {
    getAssets,
    getAsset,
    getConfigByAssetID,
    getDevicesByAsset,
    addAsset,
    addAssetByConfig,
    addAssetByConfigFile,
    deleteAsset,
    updateAsset
};
