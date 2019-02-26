import React from 'react';

export const NewDeviceCard = ({onAddNewDevice}) => {
    return (
        <div className="col-lg-3 col-xl-2 col-md-4 col-xs-6 col-sm-4">
            <a data-toggle="modal" onClick={onAddNewDevice}>
                <div className="card mb-2 border-secondary NewCardBox" style={{minWidth: 100}}>
                    <div className="my-auto text-center">
                        <div className="card-body text-secondary ">
                            <p>Add New Device</p>
                            <div className="AddNewDevice mx-auto">+</div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}
