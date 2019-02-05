import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { assetActions } from '../../_actions/assetAction'
import { Button } from 'reactstrap';

const MainTableRow = (props) => {
    return(
        <tr>
            <td>
              <a href={"/asset/" + props.singleAsset.AssetID + "/dashboard"}
                onClick={()=>props.assetClicked(props.singleAsset.AssetID,props.singleAsset.DisplayName)}>
                  {props.singleAsset.DisplayName}
              </a>
            </td>
            <td style={props.status==="Running"?{color:'#08D800'}:{color:'red'}}>{props.status}</td>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/device"}>{props.singleAsset.Devices.length}</a></td>
            <td>{props.singleAsset.Location}</td>
            <td>
              <Button style={{marginRight: "10px"}}
                      href="#"
                      data-toggle="modal"
                      data-target="#editAssetModal"
                      id="editAssetModalButton">
                        <i className="fas fa-edit"></i>
              </Button>
              <Button color="danger"
                      onClick={()=>props.deleteSelectedAsset(props.singleAsset.AssetID, props.user)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
              </Button>
            </td>
        </tr>
    );
};

class MainArea extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        clickedAsset: null
      }
      this.deleteAsset = this.deleteAsset.bind(this);
    }

    assetSelected(id,name){
      localStorage.setItem("selectedAssetID", id);
      localStorage.setItem("selectedAssetName", name);
    }

    deleteAsset(asset, user){
      if (confirm("Are you sure to delete this asset?")){
          this.props.dispatch(assetActions.deleteAsset(asset, user));
      }
    }

    render() {
        return (
            <div id="MainArea">
                <div className="table-responsive">
                    <table className="table table-striped" style={{textAlign:'center'}}>
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Status</th>
                                <th>Device Count</th>
                                <th>Location</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody id="main-table-content">
                            {this.props.assets.map((singleAsset,i) =>
                                <MainTableRow assetClicked={this.assetSelected} deleteSelectedAsset={this.deleteAsset} user={this.props.user} singleAsset={singleAsset} key={i} status="Running" health="OK" alerts={0}/>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}
 export default MainArea
