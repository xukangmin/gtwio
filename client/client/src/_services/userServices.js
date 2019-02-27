import { gConstants } from '../_components/constants'

export const userService = {
    login,
    logout,
    register,
    activate,
    reset,
    resetPassword
};


function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'EmailAddress': username,
            'Password': password
        })
    };

    return fetch(process.env.API_HOST + '/user/login', requestOptions)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        })
        .then(user => {
            // login successful if there's a jwt token in the response
            if (user) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('assets');
}

function register(email, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'EmailAddress': email,
            'Password': password
        })
    };

    return fetch(process.env.API_HOST + '/user/createUser', requestOptions)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        })
        .then(user => {
            console.log(user);
            // reg success with verification link
            return user;
        });
}

function activate(id, code) {

    return fetch(process.env.API_HOST + '/user/activate?UserID=' + id + '&ActivateKey=' + code)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        })
        .then(user => {
            console.log(user);
            // reg success with verification link
            return user;
        });

}

function reset(email) {

    return fetch(process.env.API_HOST + '/user/resetUser?EmailAddress=' + email)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        })
        .then(data => {
            console.log(data);
            // reg success with verification link
            return data;
        });

}

function resetPassword(email, password) {

    return fetch(process.env.API_HOST + '/user/updatePassword?EmailAddress=' + email + '&Password=' + password)
        .then(response => {
            return Promise.all([response, response.json()])
        })
        .then( ([resRaw, resJSON]) => {
            if (!resRaw.ok)
            {
                return Promise.reject(resJSON.message);
            }
            return resJSON;
        })
        .then(data => {
            console.log(data);
            // reg success with verification link
            return data;
        });

}
