import React from 'react';

export const SettingModal = (props) => {
    return (
        <div className="modal fade" id="dataModal" role="dialog" aria-labelledby="dataModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title" id="dataModalTitle">{props.dataid + " Config"}</h4>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                            <li className="nav-item">
                            <a className="nav-link active" id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">Graph</a>
                            </li>
                            <li className="nav-item">
                            <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Settings</a>
                            </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                            <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                            <div id="modalLineChart"></div>
                            </div>
                            <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                            <div className="container settings-box" height="400px" width="700px">
                                <div className="row">
                                <div className="col">
                                    <p>Select Parameters</p>
                                </div>
                                <div className="col">
                                    <select className="selectpicker" id="parameterOptions">
                                    </select>
                                </div>
                                </div>
                                <hr />
                            </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}