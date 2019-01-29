import React from 'react';

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
            <td>{props.singleAsset.LatestTimeStamp}</td>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/device"}>{props.singleAsset.Devices.length}</a></td>
            <td>{props.singleAsset.Location}</td>
            <td style={props.alerts===0?{color:'#08D800'}:{color:'red'}}>{props.alerts}</td>
            <td style={props.health==="OK"?{color:'#08D800'}:{color:'red'}}>{props.health}</td>
            <td>
              <button style={{marginRight: "10px"}} onClick={()=>props.editAssetTarget(props.singleAsset.DisplayName)} type="button" className="btn btn-info" href="#" data-toggle="modal" data-target="#editAssetModal" id="editAssetModalButton"><i className="fas fa-edit"></i></button>
              <button type="button" className="btn btn-info" href="#" data-toggle="modal" data-target="#deleteAssetModal" id="deleteAssetModalButton"><i className="fas fa-trash-alt"></i></button>

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
    }

    assetSelected(id,name){
      localStorage.setItem("selectedAssetID", id);
      localStorage.setItem("selectedAssetName", name);
    }

    editAsssetSelected(name){
      localStorage.setItem("ToEditAsset", name)
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
                                <th>Latest Time Stamp</th>
                                <th>Device Count</th>
                                <th>Location</th>
                                <th>Alerts</th>
                                <th>Health</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody id="main-table-content">
                            {this.props.assets.map((singleAsset,i) =>
                                <MainTableRow assetClicked={this.assetSelected} editAssetTarget={this.editAsssetSelected} singleAsset={singleAsset} key={i} status="Running" health="OK" alerts={0}/>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}


export default MainArea
