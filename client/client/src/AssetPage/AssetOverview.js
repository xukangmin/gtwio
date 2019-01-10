import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { dataActions } from '../_actions/dataAction';
import './asset.css';
import Loader from '../_components/loader';
import SideNav from '../_components/sideNav';
import HeaderNav from '../_components/headerNav';
import { Samy, SvgProxy } from 'react-samy-svg';
import svgcontents from 'raw-loader!./svg/HeatExchanger.svg';
import { SettingModal } from './overview_parts/SettingModal';

class AssetOverview extends React.Component {
  constructor(props) {
    super(props);
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets = JSON.parse(localStorage.getItem('assets'));

    this.state = {
        AssetID : props.match.params.assetID,
        CurrentAsset : this.assets.Items.filter(item => item.AssetID === props.match.params.assetID)[0],
        Settings: {
          ShellInlet: "23.5",
          ShellOutlet: "12.5",
          TubeInlet: "12.5",
          TubeOutlet: "33.5"
        },
        dataid: ""
    }

    this.HandleText = this.HandleText.bind(this);
    this.HandleModalClick = this.HandleModalClick.bind(this);
  }

  HandleModalClick(e) {
    // get setting
    this.setState({dataid: e.target.id});
  }

  HandleText(elem){
    const { Settings } = this.state;
    elem.innerHTML = Settings[elem.id];
  }

  render() {
    //const { assets } = this.state;
    const { AssetID, Settings, dataid } = this.state;
    if (!this.user)
    {
      return (<Redirect to='/login' />);
    }
    else{
      return (
        <div className="mt-5" >
          <Samy svgXML={svgcontents} >
            {Object.keys(this.state.Settings).map((item,i) => 
              <SvgProxy selector={"#" + item} key={i} onElementSelected={(elem) => this.HandleText(elem)} onClick={(e) => this.HandleModalClick(e)}/>
            )}
          </Samy>
          <SettingModal dataid={dataid} />
        </div>
      );
    }

  }
}

function mapStateToProps(state) {
  const { data, msg } = state.data
  return {
      assets : data,
      msg: msg
  };
}

const connectedPage = connect(mapStateToProps)(AssetOverview);
export { connectedPage as AssetOverview };
