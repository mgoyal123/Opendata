from flask import Flask, render_template, jsonify, request, url_for, abort, g
from models.login import loginpage
from models.disconnect import logout
from models.dbconnect import *
from flaskext.mysql import MySQL
import MySQLdb
import MySQLdb.cursors
import decimal
import flask.json as json

class MyJSONEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings.
            return str(obj)
        return super(MyJSONEncoder, self).default(obj)

mysql = MySQL()
app = Flask(__name__)
app.json_encoder = MyJSONEncoder

app.register_blueprint(loginpage)
app.register_blueprint(logout)
conn = MySQLdb.Connect(host='edvantics-opendata.cswt8s1fa1ht.us-east-2.rds.amazonaws.com', user='root', passwd='opendata', db='aishe',compress=1,cursorclass=MySQLdb.cursors.DictCursor)
# conn = MySQLdb.Connect(host='localhost', user='root', passwd='root', db='aishe',compress=1,cursorclass=MySQLdb.cursors.DictCursor)
cursor = conn.cursor()

@app.route("/")
@app.route('/GER/')
def showGER():
	cursor.execute("select x.name, x.ger from (select a.name, sum(b.enrollment_count)/c.total*100 as ger from ref_state as a join enrolment as b on a.st_code = b.state_code join total_eligible_population as c on c.state = a.name group by a.name,c.total order by ger) as x where x.ger <= 23.55");
	avg_ger_data = cursor.fetchall()
	
	cursor.execute("select a.name, sum(b.enrollment_count)/c.total*100 as ger from ref_state as a join enrolment as b on a.st_code = b.state_code join total_eligible_population as c on c.state = a.name group by a.name,c.total order by ger desc limit 10");
	highest_ger = cursor.fetchall()

	cursor.execute("select count(x.district_code) as count, (select count(dist_code) from ref_district) as total from (select district_code, count(id) as count from college_institution group by district_code order by count) as x where x.count < 10;")
	districts_data = cursor.fetchone()
	districts_ratio = (1.0*districts_data["count"]/districts_data["total"])*100

	cursor.execute("select count(state_code) as count from college_per_lakh_population where college_per_lakh < (select avg(college_per_lakh) from college_per_lakh_population)")
	data = cursor.fetchone()
	college_per_lakh = (1.0*data["count"]/36)*100

	cursor.execute("select count(state_code) as count from college_per_lakh_population where average_enrollment < (select avg(average_enrollment) from college_per_lakh_population)")
	data = cursor.fetchone()
	average_enrollment = (1.0*data["count"]/36)*100

	cursor.execute("select count(state) as count from pupil_teacher_ratio where pupil_teacher_ratio < (select avg(pupil_teacher_ratio) from pupil_teacher_ratio);")
	data = cursor.fetchone()
	pupil_teacher_ratio = (1.0*data["count"]/36)*100


	cursor.execute("select a.level, sum(b.appeared_total) as total_appeared, sum(b.passed_total) as total_passed from ref_course_level as a join examination_result as b where a.id = b.course_level_id group by a.level order by a.level desc")
	outturn_data = cursor.fetchall()
	outturn_percentage = []
	for row in outturn_data:
		outturn = int((row["total_passed"]/row["total_appeared"])*100)
		temp = {'level': row["level"], 'pass_percent': outturn, 'pass' : row["total_passed"]}
		outturn_percentage.append(temp)

	cursor.execute("select a.speciality, count(b.id) as count from ref_speciality as a right join college_institution as b on a.id = b.speciality_id group by a.speciality order by count desc;")
	college_data = cursor.fetchall()
	college_data = modifyNullSpeciality(college_data)
	
	data = {
	'avg_ger_data' : avg_ger_data,
	'college_data' : college_data
	}
	return render_template('ger.html', DATA=json.dumps(data), districts_ratio=districts_ratio, 
		outturn=outturn_percentage, highest_ger=highest_ger, college_per_lakh=college_per_lakh,
		average_enrollment=average_enrollment, pupil_teacher_ratio=pupil_teacher_ratio)
	# return render_template('temp.html')


@app.route("/institutions/")
# @auth.login_required
def showInstitutes():
	cursor.execute("select b.speciality, c.type, d.name, count(a.id) as count from university as a left join ref_speciality as b on a.speciality_id = b.id join ref_university_type as c on c.id = a.type_id join ref_state as d where a.state_code = d.st_code group by a.speciality_id, b.speciality, c.id, c.type, d.name");
	data = cursor.fetchall()
	univs_data = data
	univs_data = modifyNullSpeciality(data)
	cursor.execute("select a.management, c.speciality, d.name, count(b.id) as count from ref_institution_management as a join college_institution as b left join ref_speciality as c on b.speciality_id = c.id join ref_state as d on b.state_code = d.st_code where a.id = b.management_id group by a.management, c.speciality, d.name")
	data = cursor.fetchall()
	college_data = modifyNullSpeciality(data)
	cursor.execute('select a.name as State, count(b.id) as "No of colleges", c.college_per_lakh as "Colleges per lakh population" from ref_state as a join college_institution as b on a.st_code = b.state_code join college_per_lakh_population as c where a.st_code = c.state_code group by a.name, c.college_per_lakh order by c.college_per_lakh*1 DESC;')
	data = cursor.fetchall()
	top_states, bottom_states = findTopBottomStates(data)
	# print top_states, bottom_states
	comibed_data = {'university' : univs_data, 'college' : college_data , 'top_states' : top_states, 'bottom_states' : bottom_states}
	return render_template('institutions.html', DATA=json.dumps(comibed_data))


def findTopBottomStates(data):
	l = len(data)
	top_states = []
	bottom_states = []
	for i in range(0,10):
		top_states.append(data[i])
		bottom_states.append(data[l-i-1])

	return top_states,bottom_states


def modifyNullSpeciality(data):
	temp = []
	for row in data:
		if row["speciality"] == None:
			row["speciality"] = "General"
		temp.append(row)
	return temp


@app.route('/enrolment/')
def showEnrolment():
	cursor.execute("select a.name, c.level, d.discipline_group_category, b.enrollment_count from ref_state as a join enrolment as b on a.st_code = b.state_code join ref_course_level as c on b.level_id = c.id join ref_broad_discipline_group_category as d on b.broad_discipline_group_category_id = d.id");
	data = cursor.fetchall()
	return render_template('enrollment.html', DATA=json.dumps(data))



if __name__ == "__main__":
	app.secret_key = 'super_secret_key'
	app.debug = True
	app.run(host = '0.0.0.0', port = 5000)
