import React from 'react';

const MainTableRow = (props) => {
    return(
        <tr>
            <td><a href={"/asset/" + props.singleAsset.AssetID + "/overview"}>{props.singleAsset.DisplayName}</a></td>
            <td>{props.singleAsset.LatestTimeStamp}</td>
            <td>{props.singleAsset.DeviceCount}</td>
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
                                <th>Latest Time Stamp</th>
                                <th>Device Count</th>
                            </tr>
                        </thead>
                        <tbody id="main-table-content">
                            {this.props.assets.Items.map((singleAsset,i) => 
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