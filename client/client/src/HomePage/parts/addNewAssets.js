import React from 'react'
import { assetActions } from '../../_actions/assetAction'
import $ from 'jquery'

class AddNewAssets extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayname: '',
            showModal: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.dispatch(assetActions.addAsset(this.props.user,this.state.displayname));
        $(this.modal).modal('hide');
    }

    handleEditSubmit(e){
      e.preventDefault();
      this.props.dispatch(assetActions.editAsset(this.props.user,this.state.displayname));
      $(this.modal).modal('hide');
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState( { [name]: value} );
    }

    render() {
        const { displayname } = this.state;

        return(
            <div>
                <button type="button" className="btn btn-info" href="#" data-toggle="modal" data-target="#addNewAssetModal" id="addNewAssetModalButton">Add New Asset</button>

                <div className="modal fade" id="addNewAssetModal" tabIndex="-1" role="dialog" aria-labelledby="addNewAssetModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="dataModalTitle">Add New Asset</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="container" id="addNewAseetFormContainer">
                                    <form onSubmit={this.handleSubmit} role="form" style={{display: 'inline-block'}} id="addNewAseetForm">
                                        <div className="form-group row">
                                            <label htmlFor="eee" className="col-5 col-form-label">Asset Name</label>
                                            <div className="col-7">
                                                <input className="form-control" type="text" id="assetname" name="displayname" value={displayname} onChange={this.handleChange} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" id="submitaddNewAssetForm"className="btn btn-primary" type="submit" form="addNewAseetForm">Add</button>
                                <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="editAssetModal" tabIndex="0" role="dialog" aria-labelledby="editAssetModal" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="dataModalTitle">Edit Asset</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="container" id="editAseetFormContainer">
                                    <form onSubmit={this.handleSubmit} role="form" style={{display: 'inline-block'}} id="editAseetForm">
                                        <div className="form-group row">
                                            <label htmlFor="eee" className="col-5 col-form-label">Asset Name</label>
                                            <div className="col-7">
                                                <input className="form-control" type="text" id="assetname" name="displayname" value={localStorage.getItem('ToEditAsset')?localStorage.getItem('ToEditAsset'):""} onChange={this.handleChange} />
                                            </div>
                                            <label htmlFor="eee" className="col-5 col-form-label">Location</label>
                                            <div className="col-7">
                                                <input className="form-control" type="text" id="assetname" name="displayname" value={localStorage.getItem('ToEditAsset')?localStorage.getItem('ToEditAsset'):""} onChange={this.handleChange} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" id="submiteditAssetForm" className="btn btn-primary" type="submit" form="editAseetForm">Save</button>
                                <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default AddNewAssets
