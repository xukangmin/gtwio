import React from 'react';

const AssetSubMenu = (props) => {
    return (
        <li className="nav-item">
            <a className="nav-link" href={"/asset/" + props.singleAsset.AssetID + "/overview"}  >
                <i className="fas fa-align-justify mr-2"></i>{props.singleAsset.DisplayName}
            </a>
        </li>
    );
};

class SideNav extends React.Component {
    constructor(props) {
        super(props);
      }

    render() {
        return (
            <nav className ="col-md-2 d-none d-md-block bg-light sidebar" id="sidebar">
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
                                <i className ="fas fa-suitcase mr-2"></i>
                                Assets
                            </a>
                            <ul className ="collapse list-unstyled" id="assetSubMenu">
                                {this.props.assets.Items.map((singleAsset,index) => 
                                    <AssetSubMenu key={index} singleAsset={singleAsset} />
                                )}
                            </ul>
                        </li>
                        <li className ="nav-item">
                            <a className ="nav-link" href="/devices">
                                <i className ="fas fa-cogs mr-1"></i>
                                Devices
                            </a>
                        </li>
                        <li className ="nav-item">
                            <a className ="nav-link" href="/settings">
                                <i className ="fas fa-cog mr-2"></i>
                                Parameters
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }

}


export default SideNav;