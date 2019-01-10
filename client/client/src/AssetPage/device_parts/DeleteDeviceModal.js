import React from 'react';

export const DeleteDeviceModal = ({onDel}) => {
    return (
        <div className="modal fade" id="DeleteDeviceModal" role="dialog" aria-labelledby="DeleteDeviceModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header alert alert-danger">
                        <h4 className="modal-title" id="DeleteDeviceModalTitle">Delete a device</h4>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete selected device?</p>
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={onDel}>Yes</button>
                    <button type="button" className="btn btn-primary" data-dismiss="modal">No</button>
                    </div>
                </div>
            </div>
        </div>
    );
}