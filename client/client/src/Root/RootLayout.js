import React, {Component} from 'react';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import routes from '../_routes/routes';
import Picker from '../Widgets/RangePicker';
import BaselinePicker from '../Widgets/BaselinePicker';
import { assetActions } from '../_actions/assetAction';
import Loader from '../Pages/Loader';
import 'antd/dist/antd.css';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class RootLayout extends Component {
  constructor(props) {
    super(props);
    
    this.user = JSON.parse(localStorage.getItem('user'));
    this.assets_local = JSON.parse(localStorage.getItem('assets'));
    if (this.user && !this.assets_local)
    {
      this.props.dispatch(assetActions.getAssets(this.user));
    }

    let m_res = matchRoutes(routes, window.location.pathname);
    for (var item in m_res) {
      if (m_res[item].match.isExact) {
        if (m_res[item].match.params.assetID) {
          this.asset = m_res[item].match.params.assetID;
        }
      }
    }
    
    this.state = {
      collapsed: false,
    };

    this.onCollapse = this.onCollapse.bind(this)
  }
  
  onCollapse(collapsed){
    this.setState({ collapsed });
  }

  render() {
    const { assets } = this.props;
    console.log(this.asset)
    console.log(assets)
    // this.assets = assets;
    // localStorage.setItem('assets', assets);
    let assets_display = null;
      if (this.assets_local)
      {
        assets_display = this.assets_local;
      }
      else{
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
        >
          <Menu theme="light" mode="inline">
            

            <Menu.Item key="5">
          <span>IIOT Monitor</span>
            </Menu.Item>     
          </Menu>

          <Menu theme="dark" mode="inline">
            <Menu.Item key="1">
              <a href="/">
                <Icon type="home" />
                <span>Overview</span>
              </a>
            </Menu.Item>
            
            <SubMenu
              key="sub-1"
              title={<span><Icon type="bars" /><span>Assets</span></span>}
            >
            {assets_display ?
              assets_display.map((asset,index) => <Menu.Item key={'asset-' + index}><a href={"/asset/" + asset.AssetID + "/dashboard"}>{asset.DisplayName}</a></Menu.Item>)
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
        <Menu theme="light" defaultSelectedKeys={['5']} mode="inline" className="mt-5">
            

            <Menu.Item key="5">
            <a href={"/asset/" + this.asset + "/dashboard"}>
          <Icon type="folder" />
          <span>{assets_display.find(item => item.AssetID === this.asset).DisplayName}</span>
        </a>
            </Menu.Item>     
          </Menu>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            

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

            <Menu.Item key="9">
              <a href={"/asset/" + this.asset + "/configurations"}>
                <Icon type="setting" />
                <span>Configurations</span>
              </a>
            </Menu.Item>
          </Menu></div>
          :
          <div></div>
          }
          

        </Sider>
        <Layout style={{background: 'white'}}>
          <Header style={{ padding: '16px', position: 'fixed', zIndex: 999}}>
            <Picker style={{display: "inline-block"}} dispatch={this.props.dispatch}/>
            <BaselinePicker style={{display: "inline-block"}} dispatch={this.props.dispatch}/>
          </Header>
          <Content style={{ margin: '36px 16px 16px 16px'}}>
              {renderRoutes(this.props.route.routes, {store : this.props.store})}            
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            GTW Labs ©2019
          </Footer>
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
