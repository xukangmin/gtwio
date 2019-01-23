import React from 'react';

class AssetNav extends React.Component {
    constructor(props) {
        super(props);

      }

    render() {
        return (
          <ul style={{display:this.props.id===null?"none":"block"}} className ="nav flex-column">
            <li className ="nav-item">
              <a className ="nav-link ml-3" href={"/asset/"+this.props.id+"/dashboard"}>
                <i className ="fas fa-industry mr-2"></i>
                {this.props.assetname}
              </a>
              <a className ="nav-link ml-3" href={"/asset/"+this.props.id+"/device"}>
                <i className ="fas fa-temperature-low mr-2"></i>
                Devices
              </a>
              <a className ="nav-link ml-3" href="/">
                <i className ="fas fa-sliders-h mr-2"></i>
                Parameters
              </a>
            </li>
            </ul>
        );
    }
}


export default AssetNav;
