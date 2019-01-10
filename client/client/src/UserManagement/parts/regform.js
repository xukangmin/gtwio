import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../../_actions/userAction';
import { alertActions } from '../../_actions/alertAction';

class RegForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
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
        
        // this.setState({ submitted: true });
        // const { user } = this.state;
        const { dispatch } = this.props.store;

        // if (user.firstName && user.lastName && user.username && user.password) {
        //     dispatch(userActions.register(user));
        // }
        const { email, password, confirm_password } = this.state;
        if (email){
            if (password === confirm_password)
            {
                dispatch(userActions.register(email, password));
            }
            else{
                dispatch(alertActions.error('Password not match'));
            }
        }
        else{
            dispatch(alertActions.error('Please Enter Email Address'));
        }    
    }    

    render() {
        const { email, password, confirm_password, submitted } = this.state;
        const { user, message } = this.props;
        return (
            <form id="register-form" onSubmit={this.handleSubmit} role="form">
                <div className="form-group">
                    <input type="email" name="email" id="emailreg" tabIndex="1"
                        className="form-control" placeholder="Email Address" value={email} onChange={this.handleChange} />
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
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Register</button>
                </div>
                {message && 
                    <div className="container" id="alert">
                            <div className="alert alert-danger">{message}</div>
                    </div>
                }
            </form>
        );
    }

}

const mapStateToProps = (state) => { 
    const { user } = state.reg;
    const { message } = state.alert;
    return {
        user,
        message
    };
}

const connectedRegPage = connect(mapStateToProps)(RegForm);
export { connectedRegPage as RegForm };