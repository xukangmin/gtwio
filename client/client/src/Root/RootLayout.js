import React, {Component} from 'react';
import Link from 'react-router-dom/Link';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';
import { Pickers } from '../Widgets/Pickers';
// import { BaselinePicker } from '../Widgets/BaselinePicker';
import { assetActions } from '../_actions/assetAction';
import Loader from '../Widgets/Loader';
import './antd.css';
import { Layout, Menu, Icon } from 'antd';
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class RootLayout extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      collapsed: true,
      pickersDisplay: true
    };

    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets_local = JSON.parse(localStorage.getItem('assets'));

    if (this.user && !this.assets_local)
    {
      this.props.dispatch(assetActions.getAssets(this.user));
    }    

    let m_res = matchRoutes(routes, window.location.pathname);
    for(var item in m_res) {
      if (m_res[item].match.isExact) {
        this.asset = m_res[item].match.params.assetID;
      }
      // if (m_res[item].match.url.includes("configurations") || !this.asset){
      //   this.setState({
      //     pickersDisplay: false
      //   });
      // }
    }
        
    this.onCollapse = this.onCollapse.bind(this)
  }
  
  onCollapse(collapsed){
    this.setState({ collapsed });
  }

  render() {
    let { assets } = this.props;
    let assets_display = null;
    if (this.assets_local){
      assets_display = this.assets_local;
    } else{
      assets_display = assets;
    }

    if (!this.user) {
      return (<Redirect to='/login'/>);
    } else {
      return (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            collapsible
            collapsed={this.state.collapsed}
            onCollapse={this.onCollapse}
            style={{position: 'fixed', marginTop: '58px', height: '100vh', backgroundColor: 'white'}}>
            <Menu mode="inline" className="pt-2">
              <Menu.Item key="2">
                <a href="/">
                  <Icon type="home" />
                  <span>Overview</span>
                </a>
              </Menu.Item>
              
              <SubMenu
                key="sub-1"
                title={<span><Icon type="bars" /><span>Assets</span></span>}>
                {assets_display ? assets_display.map((asset,index) => <Menu.Item key={'asset-' + index}><a href={"/asset/" + asset.AssetID + "/dashboard"}>{asset.DisplayName}</a></Menu.Item>)
                :<Loader/>}
              </SubMenu>
              
              <Menu.Item key="3">
                <a href="/settings">
                  <Icon type="setting" />
                  <span>Settings</span>
                </a>
              </Menu.Item>
            </Menu>

            {this.asset ? 
              <div>                
                <Menu mode="inline" className="mt-5 pt-1" style={{backgroundColor: '#f6f6f6', height: '58px'}}> 
                  <Menu.Item key="4">                    
                    <a href={"/asset/" + this.asset + "/dashboard"}>
                    <Icon type="folder" />
                    <span><strong>{assets_display.find(item => item.AssetID === this.asset).DisplayName}</strong></span>
                    </a>
                  </Menu.Item>     
                </Menu>
              
                <Menu mode="inline">
                  <Menu.Item key="5">
                    <a href={"/asset/" + this.asset + "/dashboard"}>
                      <Icon type="dashboard" />
                      <span>Dashboard</span>
                    </a>
                  </Menu.Item>          
                            
                  <Menu.Item key="6">
                    <a href={"/asset/" + this.asset + "/data"}>
                      <Icon type="table" />
                      <span>Data</span>
                    </a>
                  </Menu.Item>

                  <Menu.Item key="7">
                    <a href={"/asset/" + this.asset + "/configurations"}>
                      <Icon type="setting" />
                      <span>Configurations</span>
                    </a>
                  </Menu.Item>
                </Menu>
              </div>
              :
              <div></div>
            }     
          </Sider>

          <Layout style={{background: 'white'}}>
            <Header style={{position: 'fixed', width: '100%', zIndex: 999}}>
              <div className="row justify-content-md-center" style={{height: '100%'}}>
                <div className="col-md-auto" style={{padding: '15px 0 0 25px', display: 'none'}}>
                  <span><strong>IIOT Monitor</strong></span>
                </div>
                <div className="col text-center" style={{paddingTop: '10px'}}>
                  {this.asset ?
                  <Pickers style={{display: "inline-block"}} assets={assets_display} dispatch={this.props.dispatch}/>
                  :
                  <div></div>}
                  </div>
                <div className="col-md-auto" style={{paddingTop: '0'}}>
                  <Link to="/login">Logout</Link>
                </div>
              </div>          
            </Header>
            <Content style={{ padding: '70px 16px 16px 16px', overflow: 'hidden', marginLeft: this.state.collapsed ? '80px' : '200px'}} >
              {renderRoutes(this.props.route.routes, {store : this.props.store})}            
            </Content>
          </Layout>
        </Layout>
      )
    }
  }
}
  
function mapStateToProps(state) {
  const { data, msg } = state.asset;
  return {
      assets : data,
      msg: msg
  };
}

const connectedPage = connect(mapStateToProps)(RootLayout);
export { connectedPage as RootLayout };
