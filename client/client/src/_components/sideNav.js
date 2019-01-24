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
    }

    assetSelected(assetid,assetname){
      localStorage.setItem("selectedAssetID", assetid);
      localStorage.setItem("selectedAssetName", assetname);
    }

    render() {
        return (
          <nav className ="d-none d-md-block bg-light sidebar col-sm-3 col-md-2" id="sidebar">
                <div className ="sidebar-sticky">
                    <ul className ="nav flex-column">
                        <li className ="nav-item">
                            <a className ="nav-link" href="/">
                                <i className ="fas fa-home mr-2"></i>
                                Overview
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
                    {localStorage.getItem("selectedAssetID")?
                    <ul style={{marginTop:"30px"}} className ="nav flex-column">
                      <li className ="nav-item">
                        <a className ="nav-link bg-dark" style={{color:"white", textAlign:"center"}} href={"/asset/"+localStorage.getItem("selectedAssetID")+"/dashboard"}>
                          {localStorage.getItem("selectedAssetName")}
                        </a>
                      </li>
                      <li className ="nav-item" style={{marginTop:"15px"}}>
                        <a className ="nav-link" href={"/asset/"+localStorage.getItem("selectedAssetID")+"/dashboard"}>
                          <i className ="fas fa-tachometer-alt mr-2"></i>
                          Dashboard
                        </a>
                      </li>
                      <li className ="nav-item">
                        <a className ="nav-link" href={"/asset/"+localStorage.getItem("selectedAssetID")+"/device"}>
                          <i className ="fas fa-temperature-low mr-2"></i>
                          Devices
                        </a>
                      </li>

                      <li className ="nav-item">
                        <a className ="nav-link" href="/">
                          <i className ="fas fa-sliders-h mr-2"></i>
                          Parameters
                        </a>
                      </li>
                    </ul>
                    :<div></div>}


                </div>
            </nav>
        );
    }
}


export default SideNav;
