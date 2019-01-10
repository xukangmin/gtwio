import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../../_actions/userAction';

class ForgotPasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
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
        const { email } = this.state;
        if (email) {
            this.props.store.dispatch(userActions.reset(email));
        }
    }    

    render() {
        const { resetting, msg } = this.props;
        const { email, submitted } = this.state;
        return (
            <form id="forgot-password-form" onSubmit={this.handleSubmit} role="form">
                <div className="form-group">
                    <div className="alert alert-info" role="alert">
                        Please Enter your email to get reset link
                    </div>
                    <input type="email" name="email" id="email" tabIndex="1" className="form-control" placeholder="Email Address" value={email} onChange={this.handleChange} />
                </div>
                <div className="form-group">
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Send</button>
                </div>
                {resetting &&
                    <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                }
                {msg && 
                    <div className="container" id="alert">
                            <div className="alert alert-danger">{msg}</div>
                    </div>
                }
            </form>
        );
    }

}


const mapStateToProps = (state) => { 
    const { resetting, msg } = state.reset;
    return {
        resetting,
        msg
    };
}

const connectedPage = connect(mapStateToProps)(ForgotPasswordForm);
export { connectedPage as ForgotPasswordForm };