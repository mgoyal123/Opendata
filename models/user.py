from models.dbconnect import *


# Creating a new user in database
def createUser(login_session):
    newUser = User(name=login_session['username'],
                   email=login_session['email'])
    if login_session['provider'] == 'native':
        newUser.hash_password(login_session['password'])

    session.add(newUser)
    session.commit()
    user = session.query(User).filter_by(email=login_session['email']).first()
    return user.id


# Getting details of existing user from database by using user_id
def getUserInfo(user_id):
    user = session.query(User).filter_by(id=user_id).first()
    return user


# Getting user_id of existing user by using email id
def getUserId(email):
    try:
        user = session.query(User).filter_by(email=email).first()
        return user.id
    except:
        return None
