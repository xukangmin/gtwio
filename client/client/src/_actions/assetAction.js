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
                      dispatch(failure_tag(error));
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
    function failure_tag(error) { return { type: gConstants.GET_ASSET_TAG_FAILURE, error } }
    function success_tag(data) { return {type: gConstants.GET_ASSET_TAG_SUCCESS, data } }
}

const getAssetConfig = (asset) => {
    return dispatch => {
        dispatch(request());
        assetServices.getAssetConfig(asset)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_ASSET_CONFIG_REQUEST } }
    function success(data) { return { type: gConstants.GET_ASSET_CONFIG_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_ASSET_CONFIG_FAILURE, error } }
}

const updateAssetConfig = (asset, data) => {
    return dispatch => {
          dispatch(request());
          assetServices.updateAssetConfig(asset, data)
              .then(
                  info => {
                      dispatch(getAssetConfig(asset));
                      dispatch(success(info));
                  },
                  error => {
                      dispatch(failure(error));
                  }
              );
      };
  
      function request() { return { type: gConstants.UPDATE_ASSET_CONFIG_REQUEST } }
      function success(data) { toastr.success("Configurations Updated"); return { type: gConstants.UPDATE_ASSET_CONFIG_SUCCESS, data } }
      function failure(error) { toastr.warning("Failed to Update Configurations"); return { type: gConstants.UPDATE_ASSET_CONFIG_FAILURE, error } }
  }

const getConfigByAssetID = (user, assetID) => {
    return dispatch => {
      dispatch(request());
      assetServices.getConfigByAssetID(user, assetID)
        .then(
          data => {
            dispatch(success(data));
          },
          error => {
            dispatch(failure(error));
          }
        )
    };

    function request() { return { type: gConstants.GET_CONFIG_BY_ASSET_ID_REQUEST } }
    function success(data) { toastr.success("Config File Downloaded"); return { type: gConstants.GET_CONFIG_BY_ASSET_ID_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_CONFIG_BY_ASSET_ID_FAILURE, error } }
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

const getTimeRangeByAsset = (assetID) => {
    return dispatch => {
        dispatch(request());
        assetServices.getTimeRangeByAsset(assetID)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_TIME_RANGE_BY_ASSET_REQUEST } }
    function success(data) { return { type: gConstants.GET_TIME_RANGE_BY_ASSET_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_TIME_RANGE_BY_ASSET_FAILURE, error } }
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
    function success(msg) { return { type: gConstants.DELETE_ASSET_SUCCESS, msg } }
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
    function failure(error) { toastr.warning("Failed to Update Asset"); return { type: gConstants.UPDATE_ASSET_FAILURE, error } }
}

const getBaselines = (user, assetID) => {
    return dispatch => {
        dispatch(request());
        assetServices.getBaselines(user, assetID)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_BASELINES_REQUEST } }
    function success(data) { return { type: gConstants.GET_BASELINES_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_BASELINES_FAILURE, error } }
}

const addBaseline = (user, assetID, timestamp) => {
    return dispatch => {
        dispatch(request());
        assetServices.addBaseline(user, assetID, timestamp)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getBaselines(assetID));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_BASELINE_REQUEST } }
    function success(msg) { return { type: gConstants.ADD_BASELINE_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_BASELINE_FAILURE, error } }
}

const deleteBaseline = (user, assetID, timestamp) => {
    return dispatch => {
        dispatch(request());
        assetServices.deleteBaseline(user, assetID, timestamp)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getBaselines(assetID));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.DELETE_BASELINE_REQUEST } }
    function success(msg) { return { type: gConstants.DELETE_BASELINE_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.DELETE_BASELINE_FAILURE, error } }
}

const updateBaseline = (user, assetID, data) => {
  return dispatch => {
        dispatch(request());
        assetServices.updateBaseline(assetID, data)
            .then(
                info => {
                    dispatch(getAsset(user, assetID));
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.UPDATE_BASELINE_REQUEST } }
    function success(data) { toastr.success("Baseline Updated"); return { type: gConstants.UPDATE_BASELINE_SUCCESS, data } }
    function failure(error) { toastr.warning("Failed to Update Baseline"); return { type: gConstants.UPDATE_BASELINE_FAILURE, error } }
}

const getTimeIntervals = (assetID) => {
    return dispatch => {
        dispatch(request());
        assetServices.getTimeIntervals(assetID)
            .then(
                data => {
                    dispatch(success(data));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: gConstants.GET_TIME_INTERVALS_REQUEST } }
    function success(data) { return { type: gConstants.GET_TIME_INTERVALS_SUCCESS, data } }
    function failure(error) { return { type: gConstants.GET_TIME_INTERVALS_FAILURE, error } }
}

const addTimeInterval = (assetID, interval) => {
    return dispatch => {
        dispatch(request());
        assetServices.addTimeInterval(assetID, interval)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getTimeIntervals(assetID));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.ADD_TIME_INTERVAL_REQUEST } }
    function success(msg) { toastr.success("Interval added."); return { type: gConstants.ADD_TIME_INTERVAL_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.ADD_TIME_INTERVAL_FAILURE, error } }
}

const deleteTimeInterval = (assetID, interval) => {
    return dispatch => {
        dispatch(request());
        assetServices.deleteTimeInterval(assetID, interval)
            .then(
                info => {
                    dispatch(success(info));
                    dispatch(getTimeIntervals(assetID));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.DELETE_TIME_INTERVAL_REQUEST } }
    function success(msg) { toastr.success("Interval deleted."); return { type: gConstants.DELETE_TIME_INTERVAL_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.DELETE_TIME_INTERVAL_FAILURE, error } }
}


const setTimerIntervalActiveForTag = (assetID, tagName, assignedTag, interval) => {
    return dispatch => {
        dispatch(request());
        assetServices.setTimerIntervalActiveForTag(assetID, tagName, assignedTag, interval)
            .then(
                info => {
                    dispatch(success(info));
                },
                error => {
                    dispatch(failure(error));
                }
            )
    }

    function request() { return { type: gConstants.UPDATE_TAG_TIME_INTERVAL_REQUEST } }
    function success(msg) { return { type: gConstants.UPDATE_TAG_TIME_INTERVAL_SUCCESS, msg } }
    function failure(error) { return { type: gConstants.UPDATE_TAG_TIME_INTERVAL_FAILURE, error } }
}

const removeDevice = (sn) => {
    return dispatch => {
        dispatch(request(sn));
    }
    function request(sn) { return { type: gConstants.REMOVE_DEVICE_REQUEST, sn } }
}

const updateDevice = (data) => {
    return dispatch => {
        dispatch(request(data));
    }
    function request(data) { return { type: gConstants.UPDATE_DEVICE_REQUEST, data } }
}

const removeParameter = (tag) => {
    return dispatch => {
        dispatch(request(tag));
    }
    function request(sn) { return { type: gConstants.REMOVE_PARAMETER_REQUEST, tag } }
}

const updateParameter = (data) => {
    return dispatch => {
        dispatch(request(data));
    }
    function request(data) { return { type: gConstants.UPDATE_PARAMETER_REQUEST, data } }
}

export const assetActions = {
    getAssets,
    getAsset,
    getAssetConfig,
    updateAssetConfig,
    getConfigByAssetID,
    getDevicesByAsset,
    getTimeRangeByAsset,
    addAsset,
    addAssetByConfig,
    addAssetByConfigFile,
    deleteAsset,
    updateAsset,
    getBaselines,
    addBaseline,
    deleteBaseline,
    updateBaseline,
    getTimeIntervals,
    addTimeInterval,
    deleteTimeInterval,
    setTimerIntervalActiveForTag,
    removeDevice,
    updateDevice,
    removeParameter,
    updateParameter
};
