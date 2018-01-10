from flask import Flask, render_template, jsonify, request, url_for, abort, g
from models.login import loginpage
from models.disconnect import logout
from models.dbconnect import *


app = Flask(__name__)

app.register_blueprint(loginpage)
app.register_blueprint(logout)

@app.route("/")
# @auth.login_required
def home():
    return render_template('index.html')




if __name__ == "__main__":
	app.secret_key = 'super_secret_key'
	app.debug = True
	app.run(host = '0.0.0.0', port = 5000)
