import React from 'react';

const MainTableRow = (props) => {
    return(
        <tr>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/dashboard"}
              onClick=
                {()=>props.assetClicked(props.singleAsset.AssetID,props.singleAsset.DisplayName)}
              >{props.singleAsset.DisplayName}</a></td>
            <td style={props.status==="Running"?{color:'#08D800'}:{color:'red'}}>{props.status}</td>
            <td>{props.singleAsset.LatestTimeStamp}</td>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/device"}>{props.singleAsset.Devices.length}</a></td>
            <td></td>
            <td style={props.alerts===0?{color:'#08D800'}:{color:'red'}}>{props.alerts}</td>
            <td style={props.health==="OK"?{color:'#08D800'}:{color:'red'}}>{props.health}</td>
        </tr>
    );
};

class MainArea extends React.Component {
    constructor(props) {
        super(props);
      }

    assetSelected(id,name){
      localStorage.setItem("selectedAssetID", id);
      localStorage.setItem("selectedAssetName", name);
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
                            </tr>
                        </thead>
                        <tbody id="main-table-content">
                            {this.props.assets.map((singleAsset,i) =>
                                <MainTableRow assetClicked={this.assetSelected} singleAsset={singleAsset} key={i} status="Running" health="OK" alerts={0}/>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}


export default MainArea
