import React from 'react';

export const DeviceCard = ({ device, assetid, onSelDel }) => {
    return (
        <div className="col-lg-3 col-xl-2 col-md-4 col-xs-6 col-sm-4">
            <div className={"card mb-2 " + (device.Status === "Active" ? "border-success" : "border-secondary" )} style={{maxWidth: 220, minWidth: 100}}>
                <a href={"/asset/" + assetid + "/detail/" + device.DeviceID}>
                    <div className="card-header">
                        {device.DisplayName}
                    </div>
                </a>
                <div className={"card-body " + (device.Status === "Active" ? "text-success" : "text-secondary" )}>
                    <div className="row">
                        <div className="col-auto mr-auto">
                            <div>{device.SerialNumber && ("S/N: " + device.SerialNumber)}</div>
                            <div>{device.Variables ?
                                  device.Variables.length + " Variables" :
                                  "0 Varibles"
                                  } 
                            </div>
                        </div>
                        <div className="col-auto device-delete-icon">
                            <a data-toggle="modal" data-target="#DeleteDeviceModal" onClick={() => onSelDel(device.DeviceID)} ><i className="fa fa-trash"  aria-hidden="false"></i></a>
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <i className={"fa fa-circle mr-2 " + (device.Status === "Active" ? "text-success circle-blink" : "text-secondary" )}></i><small className="text-muted">Last updated 3 mins ago</small>
                </div>
            </div>
        </div>
    );
}