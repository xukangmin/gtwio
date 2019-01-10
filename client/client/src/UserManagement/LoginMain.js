import React from 'react';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group' // ES6
import { LoginForm } from './parts/loginform'
import { RegForm } from './parts/regform'
import './login.css'
import { alertActions } from '../_actions/alertAction'
import { userActions } from '../_actions/userAction'
import LoginInfo from './parts/info'
import { gConstants } from '../_components/constants'
import queryString  from 'query-string'
import { ForgotPasswordForm } from './parts/forgotpassword';
import { ResetPasswordForm } from './parts/resetpassword';

class LoginMain extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.location.pathname === '/activate')
    {
      const parsed = queryString.parse(this.props.location.search);
      if (parsed.code && parsed.id)
      {
        this.props.dispatch(userActions.activate(parsed.id, parsed.code));
      }
      this.state = {showPage: 'info'};
    }
    else if (this.props.location.pathname === '/forgotpassword')
    {
      this.state = {showPage: 'forgotpassword'}
    }
    else if (this.props.location.pathname === '/reset-password')
    {
      const parsed = queryString.parse(this.props.location.search);
      if (parsed.email && parsed.code)
      {
        this.state = {
                        showPage: 'resetpassword',
                        email: parsed.email
                      }
      }
      
    }
    else {
      this.state = {showPage: 'login'};
    }
    
    this.handleClick = this.handleClick.bind(this);
    this.props.dispatch(userActions.logout());
    this.props.dispatch(alertActions.clear());
  }

  handleClick(b) {
    this.props.dispatch(alertActions.clear());
    this.setState({showPage: b});
  } 
  
  
  render() {
    let active_form = null;
    const { type, message } = this.props;

    if (type === gConstants.INFO){
      active_form = <LoginInfo {...this.props}/>
    }
    else{
      if (this.state.showPage === 'login'){
        active_form = <LoginForm {...this.props}/>;
      }
      else if (this.state.showPage === 'reg'){
        active_form = <RegForm {...this.props}/>
      }
      else if (this.state.showPage === 'forgotpassword'){
        active_form = <ForgotPasswordForm {...this.props} />
      }
      else if (this.state.showPage === 'resetpassword'){
        active_form = <ResetPasswordForm {...this.props} email={this.state.email} />
      }
    }
    
    return (
      <div id="login-page-main">
        <div className="container text-center" id="login-box">
          <div className="panel panel-login">
            <div className="panel-title">
                <h1 className="h3 mb-3 font-weight-normal">IIoT Monitoring Demo</h1>
            </div>
            <div className="panel-heading">
              <div className="row">
                <div className="col" onClick={() => this.handleClick('login')}>
                  <a href="#" className={this.state.showPage === 'login' ? 'Active' : ''} id="login-form-link">Login</a>
                </div>
                <div className="col" onClick={() => this.handleClick('reg')}>
                  <a href="#" className={this.state.showPage === 'reg' ? 'Active' : ''} id="register-form-link" >Register</a>
                </div>
              </div>
            </div>
            <hr />
            <div className="panel-body">
              <CSSTransitionGroup
                transitionName="form-trans"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>
                  {active_form}
                  <div className="container" id="alert">
                  </div>
                  <a href="/forgotpassword"> Forgot password? </a>
              </CSSTransitionGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => { 
  const { type, message } = state.alert;

  return {
      type,
      message
  };
}

const connectedPage = connect(mapStateToProps)(LoginMain);
export { connectedPage as LoginMain };