from flask import Flask, Blueprint
from flask import request, redirect, url_for
from flask import flash
import httplib2
import json
from flask import make_response
from flask import session as login_session


logout = Blueprint("logout", __name__)


# Logout
@logout.route('/disconnect')
def disconnect():
    """
    Check the authentication provider and then calls the respective disconnect
    function. Also deletes the data saved in session variable.
    """
    if 'user_id' in login_session:
        if login_session['provider'] == 'google':
            gdisconnect()
            del login_session['gplus_id']
            del login_session['access_token']

        if login_session['provider'] == 'facebook':
            fbdisconnect()
            del login_session['facebook_id']
            del login_session['access_token']

        del login_session['provider']
        del login_session['username']
        del login_session['email']
        del login_session['user_id']
        del login_session['password']


        flash('You have successfully logged out')
        return redirect(url_for('login.showLogin'))
    else:
        flash('You are not logged in')
        return redirect(url_for('login.showLogin'))


# Logout from facebook account
@logout.route('/fbdisconnect')
def fbdisconnect():
    """
    Disconnects from facebook login API
    """
    facebook_id = login_session['facebook_id']
    access_token = login_session['access_token']
    url = 'https://graph.facebook.com/%s/permissions?access_token=%s' % (
        facebook_id, access_token)
    h = httplib2.Http()
    result = h.request(url, 'DELETE')[1]
    return "you have been logged out"


# Logout from google account
@logout.route('/gdisconnect')
def gdisconnect():
    """
    Disconnects from Google Sign In API.
    """
    access_token = login_session.get('access_token')
    if access_token is None:
        response = make_response(json.dumps(
            'No active session for current user'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]

    if result['status'] == '200':
        response = make_response(json.dumps('Disconnected'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response
    else:
        response = make_response(json.dumps(
            'Failed to revoke token for given user'), 400)
        response.headers['Content-Type'] = 'application/json'
        return response
