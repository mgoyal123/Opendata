from flask import Flask, render_template, Blueprint
from flask import request, redirect,jsonify, url_for, g
from flask import flash
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
from flask import make_response
from flask import session as login_session
import requests
import random
import string
from dbconnect import *
from flask_httpauth import HTTPBasicAuth
from user import *

auth = HTTPBasicAuth()

loginpage = Blueprint("login", __name__)
CLIENT_ID = json.loads(open
                       ('client_secrets.json', 'r').read())['web']['client_id']


# Create an antiforgery state token and send it to the client side
@loginpage.route('/login')
def showLogin():
    """
    Generates a random state token and sends it to the browser to prevent
    cross site forgery attacks.
    """
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state
    return render_template('login.html', STATE=state)

@loginpage.route('/signup', methods=['POST'])
def register():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']

    login_session['provider'] = 'native'
    login_session['username'] = name
    login_session['email'] = email
    login_session['password'] = password

    if session.query(User).filter_by(email = email).first() is not None:

        flash("User already exists.Please Login..")
        return redirect(url_for('login.showLogin'))

    login_session['user_id'] = createUser(login_session)
    flash("You have succesfully registered as %s" % login_session['username'])
    return redirect(url_for('showGER'))


@loginpage.route('/signin', methods=['POST'])
def checkPwd():
    email = request.form['useremail']
    password = request.form['userpassword']
    if(verify_password(email,password)):
        flash("You are now logged in as %s" % login_session['username'])
        return redirect(url_for('showGER'))
    else:
        flash(u'Email and password do not match,Please try again','error')
        return redirect(url_for('login.showLogin'))


@auth.verify_password
def verify_password(email, password):
    user = getUserInfo(getUserId(email))
    # user = session.query(User).filter_by(email = email).first()
    if not user or not user.verify_password(password):
        return False
    g.user = user
    login_session['provider'] = 'native'
    login_session['user_id'] = user.id
    login_session['username'] = user.name
    login_session['email'] = user.email
    login_session['password'] = ""
    return True


# Login with google account using google api
@loginpage.route('/gconnect', methods=['POST'])
def gconnect():
    """
    Gathers data from Google Sign In API and places it inside a session
    variable.
    """
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameters'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    code = request.data

    try:
        oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(json.dumps(
            'Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s' %
           access_token)
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(json.dumps(
            "Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(json.dumps(
            "Token's client ID does not match app's."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')

    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(json.dumps(
            'Current user is already connected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the credentials in the session for later use.
    login_session['provider'] = 'google'
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id
    login_session['password'] = 'oauthtoken'

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['username'] = data['name']
    login_session['email'] = data['email']

    user_id = getUserId(login_session['email'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    output = ''
    output += '<h1>Welcome, '
    output += login_session['username']
    output += '!</h1>'
    flash("You are now logged in as %s" % login_session['username'])
    return output


# login with facebook using its api
@loginpage.route('/fbconnect', methods=['POST'])
def fbconnect():
    """
    Gathers data from Facebook Login API and places it inside a session
    variable.
    """
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps("Invalid state parameter"), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    access_token = request.data
    app_id = json.loads(open(
        'fb_client_secrets.json', 'r').read())['web']['app_id']
    app_secret = json.loads(open(
        'fb_client_secrets.json', 'r').read())['web']['app_secret']

    url = ('https://graph.facebook.com/oauth/access_token?graph_type='
           'fb_exchange_token&client_id=%s&client_secret=%s&fb_exchange_token='
           '%s' % (app_id, app_secret, access_token))
    h = httplib2.Http()
    result = h.request(url, 'GET')[1]
    userinfo_url = "https://graph.facebook.com/v2.8/me"
    token = result.split(',')[0].split(':')[1].replace('"', '')

    url = ('https://graph.facebook.com/v2.8/me?access_token=%s&fields=name,id'
           ',email' % access_token)
    h = httplib2.Http()
    result = h.request(url, 'GET')[1]
    data = json.loads(result)
    login_session['provider'] = 'facebook'
    login_session['username'] = data['name']
    login_session['email'] = data['email']
    login_session['facebook_id'] = data['id']
    login_session['access_token'] = token
    login_session['password'] = 'oauthtoken'

    user_id = getUserId(login_session['email'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    output = ''
    output += '<h1>Welcome, '
    output += login_session['username']
    output += '!</h1>'
    flash("You are now logged in as %s" % login_session['username'])
    return output
