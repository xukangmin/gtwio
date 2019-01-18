import React from 'react';

const MainTableRow = (props) => {
    return(
        <tr>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/overview"}>{props.singleAsset.DisplayName}</a></td>
            <td>Running</td>
            <td>{props.singleAsset.LatestTimeStamp}</td>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/device"}>{props.singleAsset.Devices.length}</a></td>
            <td>0</td>
            <td>OK</td>
        </tr>
    );
};

class MainArea extends React.Component {
    constructor(props) {
        super(props);
      }

    render() {
        return (
            <div id="MainArea">
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Status</th>
                                <th>Latest Time Stamp</th>
                                <th>Device Count</th>
                                <th>Alerts</th>
                                <th>Health</th>
                            </tr>
                        </thead>
                        <tbody id="main-table-content">
                            {this.props.assets.map((singleAsset,i) =>
                                <MainTableRow singleAsset={singleAsset} key={i}/>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}


export default MainArea
