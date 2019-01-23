import React from 'react';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import { FaHome } from 'react-icons/fa';
import AssetNav from './AssetNav';


const AssetSubMenu = (props) => {
    return (
        <li className="nav-item">
            <a className="nav-link" href={"/asset/" + props.singleAsset.AssetID + "/dashboard"} onClick={()=>props.assetClick(props.singleAsset.AssetID,props.singleAsset.DisplayName)}>
                <i className="fas fa-industry mr-2"></i>{props.singleAsset.DisplayName}
            </a>
        </li>
    );
};

class SideNav extends React.Component {
    constructor(props) {
        super(props);
        this.assetSelected = this.assetSelected.bind(this);
        this.state = {
          selectedAssetID: null,
          selectedAssetName: null
        }
    }

    assetSelected(assetid,assetname){
      this.setState(
        {
          selectedAssetID: assetid,
          selectedAssetName: assetname
        });
    }

    render() {
        return (
          <nav className ="d-none d-md-block bg-light sidebar col-sm-3 col-md-2" id="sidebar">
                <div className ="sidebar-sticky">
                    <ul className ="nav flex-column">
                        <li className ="nav-item">
                            <a className ="nav-link" href="/">
                                <i className ="fas fa-home mr-2"></i>
                                Home
                            </a>
                        </li>
                        <li className ="nav-item">
                            <a className ="nav-link" data-toggle="collapse" href="#assetSubMenu">
                                <i className ="fas fa-city mr-2"></i>
                                Assets
                            </a>
                            <ul className ="collapse list-unstyled" id="assetSubMenu">
                                {this.props.assets.map((singleAsset,index) =>
                                    <AssetSubMenu key={index} singleAsset={singleAsset} assetClick={this.assetSelected}/>
                                )}
                            </ul>
                        </li>

                        <li className ="nav-item">
                            <a className ="nav-link" href="/settings">
                                <i className ="fas fa-cog mr-2"></i>
                                Parameters
                            </a>
                        </li>


                    </ul>
                    <hr/>
                    <AssetNav id={this.state.selectedAssetID} assetname={this.state.selectedAssetName}/>
                </div>
            </nav>
        );
    }
}


export default SideNav;
