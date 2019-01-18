import React from 'react';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import { FaHome } from 'react-icons/fa';


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
        this.toggle = this.toggle.bind(this);
        this.state = {
          collapse: false,
          status: 'Closed',
          navWidth: 'col-md-2',
          iconSize: '1em'
         };
      }

    toggle() {
      this.setState({
        collapse: !this.state.collapse,
        navWidth: this.state.collapse? 'col-md-2' : 'col-md-1',
        iconSize: this.state.collapse? '1em' : '3em',
      });
    }

    render() {
        return (
          <nav className ={this.state.navWidth + " d-none d-md-block bg-light sidebar"} id="sidebar">

                <div className ="sidebar-sticky">
                    <Button color="primary" onClick={this.toggle} style={{ marginBottom: '1rem' }}>Toggle</Button>
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
                                {this.props.assets.map((singleAsset,index) =>
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
