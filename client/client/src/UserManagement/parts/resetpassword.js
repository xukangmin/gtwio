import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../../_actions/userAction';
import { alertActions } from '../../_actions/alertAction';

class ResetPasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: this.props.email,
            password: '',
            confirm_password: '',
            submitted: false};
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
      }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState( { [name]: value} );
    }

    handleSubmit(event) {
        event.preventDefault();
        const { email, password, confirm_password } = this.state;
        if (email){
            if (password === confirm_password)
            {
                this.props.store.dispatch(userActions.resetPassword(email, password));
            }
            else{
                this.props.store.dispatch(alertActions.error('Password not match'));
            }
        }
        else{
            this.props.store.dispatch(alertActions.error('Please Enter Email Address'));
        }    
    }    

    render() {
        const { resetting, msg, message } = this.props;
        const { email, password, confirm_password, submitted } = this.state;
        return (
            <form id="reset-password-form" onSubmit={this.handleSubmit} role="form">
                <div className="form-group">
                    <input type="text" name="email" id="email" tabIndex="1" className="form-control" placeholder="Email Address" value={email} onChange={this.handleChange} readOnly />
                </div>
                <div className="form-group">
                    <input type="password" name="password" id="passwordreg"
                        tabIndex="2" className="form-control" placeholder="Password" value={password} onChange={this.handleChange} />
                </div>
                <div className="form-group">
                    <input type="password" name="confirm_password"
                        id="confirm-password" tabIndex="3" className="form-control"
                        placeholder="Confirm Password" value={confirm_password} onChange={this.handleChange}/>
                </div>
                <div className="form-group">
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Reset</button>
                </div>
                {resetting &&
                    <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                }
                {(msg || message) && 
                    <div className="container" id="alert">
                            <div className="alert alert-danger">{msg || message}</div>
                    </div>
                }
            </form>
        );
    }

}


const mapStateToProps = (state) => { 
    const { resetting } = state.reset;
    const { msg } = state.reset;
    const {message} = state.alert;
    return {
        resetting,
        msg,
        message
    };
}

const connectedPage = connect(mapStateToProps)(ResetPasswordForm);
export { connectedPage as ResetPasswordForm };