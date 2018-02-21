from flask import Flask, render_template, jsonify, request, url_for, abort, g
from models.login import loginpage
from models.disconnect import logout
from models.dbconnect import *
from flaskext.mysql import MySQL
import json
import MySQLdb
import MySQLdb.cursors

mysql = MySQL()
app = Flask(__name__)
# app.config['MYSQL_DATABASE_USER'] = 'root'
# app.config['MYSQL_DATABASE_PASSWORD'] = 'opendata'
# app.config['MYSQL_DATABASE_DB'] = 'aishe'
# app.config['MYSQL_DATABASE_HOST'] = 'edvantics-opendata.cswt8s1fa1ht.us-east-2.rds.amazonaws.com'
# mysql.init_app(app)

app.register_blueprint(loginpage)
app.register_blueprint(logout)

@app.route("/")
# @auth.login_required
def home():
	conn = MySQLdb.Connect(host='edvantics-opendata.cswt8s1fa1ht.us-east-2.rds.amazonaws.com', user='root', passwd='opendata', db='aishe',compress=1,cursorclass=MySQLdb.cursors.DictCursor)
	# conn = MySQLdb.Connect(host='localhost', user='root', passwd='root', db='aishe',compress=1,cursorclass=MySQLdb.cursors.DictCursor)
	cursor = conn.cursor()
	# cursor.execute("select a.type, count(b.type_id) as count from ref_university_type as a join ref_university as b where a.id = b.type_id group by a.id, a.type order by a.id;")
	# cursor.execute("select a.speciality_id, b.speciality, a.type_id, c.type, count(a.id) as count from university as a left join ref_speciality as b on a.speciality_id = b.id join ref_university_type as c where c.id = a.type_id group by a.speciality_id, b.speciality, c.id, c.type")
	cursor.execute("select b.speciality, c.type, d.name, count(a.id) as count from university as a left join ref_speciality as b on a.speciality_id = b.id join ref_university_type as c on c.id = a.type_id join ref_state as d where a.state_code = d.st_code group by a.speciality_id, b.speciality, c.id, c.type, d.name");
	data = cursor.fetchall()
	univs_by_type = []
	# for row in data:
		# print row
		# if row.count <= 43:
		# 	if 
		# 	univ_by_type = {
		# 	'Type_id' : row["id"],
		# 	'Type' : row["type"],
		# 	'Count' : row["count"]
		# 	}
		# else:
		# 	univ_by_type = {
		# 	'Type_id' : row["id"],
		# 	'Type' : row["type"],
		# 	'Count' : row["count"]
		# 	}

		# univs_by_type.append(univs_by_type)
	for row in data:
		if row["speciality"] == None:
			row["speciality"] = "General"

		univs_by_type.append(row)
	return render_template('index.html', DATA=json.dumps(univs_by_type))




if __name__ == "__main__":
	app.secret_key = 'super_secret_key'
	app.debug = True
	app.run(host = '0.0.0.0', port = 5000)
