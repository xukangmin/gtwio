import React from 'react';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';

const AssetSubMenu = (props) => {
    return (
        <li className="nav-item">
            <a className="nav-link" href={"/asset/" + props.asset.AssetID + "/dashboard"}>
                <i className="fas fa-fw fa-industry mr-2"></i>{props.asset.DisplayName}
            </a>
        </li>
    );
};

class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.asset = [];
        this.user = JSON.parse(localStorage.getItem('user'));

        let m_res = matchRoutes(routes, window.location.pathname);
        for(var item in m_res) {
          if (m_res[item].match.isExact) {
            if  (m_res[item].match.params.assetID)
            {
              this.asset = m_res[item].match.params.assetID;
              this.assets = JSON.parse(localStorage.getItem('assets'));

              var found = this.assets.find(item => item.AssetID === this.asset);

              this.assetName = found.DisplayName;
            }
          }
        }

    }


    render() {
        return (
          <nav className ="d-none d-md-block bg-light sidebar col-sm-3 col-md-2" id="sidebar">
                <div className ="sidebar-sticky">
                    <ul className ="nav flex-column">
                        <li className ="nav-item">
                            <a className ="nav-link" href="/">
                                <i className ="fas fa-fw fa-home mr-2"></i>
                                Overview
                            </a>
                        </li>
                        <li className ="nav-item">
                            <a className ="nav-link" data-toggle="collapse" href="#assetSubMenu">
                                <i className ="fas fa-fw fa-building mr-2"></i>
                                Assets
                            </a>
                            <ul className ="collapse list-unstyled" id="assetSubMenu">
                                {this.props.assets.map((asset,index) =>
                                    <AssetSubMenu key={index} asset={asset}/>
                                )}
                            </ul>
                        </li>

                        <li className ="nav-item">
                            <a className ="nav-link" href="/settings">
                                <i className ="fas fa-fw fa-cog mr-2"></i>
                                Settings
                            </a>
                        </li>
                    </ul>

                    {this.assetName?
                    <ul style={{marginTop:"30px"}} className ="nav flex-column">
                      <li className ="nav-item">
                        <a className ="nav-link bg-dark" style={{color:"white", textAlign:"center"}} href={"/asset/" + this.asset + "/dashboard"}>
                          {this.assetName}
                        </a>
                      </li>
                      <li className ="nav-item" style={{marginTop:"15px"}}>
                        <a className ="nav-link" href={"/asset/" + this.asset + "/dashboard"}>
                          <i className ="fas fa-fw fa-tachometer-alt mr-2"></i>
                          Dashboard
                        </a>
                      </li>
                      <li className ="nav-item">
                        <a className ="nav-link" href={"/asset/" + this.asset + "/data"}>
                          <i className ="fas fa-fw fa-table mr-2"></i>
                          Data
                        </a>
                      </li>
                      <li className ="nav-item">
                        <a className ="nav-link" href={"/asset/" + this.asset + "/configurations"}>
                          <i className ="fas fa-fw fa-sliders-h mr-2"></i>
                          Configurations
                        </a>
                      </li>
                    </ul>
                    :<div></div>}
                </div>
            </nav>
        );
    }
}

export default Menu;
