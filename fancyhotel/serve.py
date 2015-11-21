from flask import Flask, render_template
from flask_restful import Api
import api as restapi



app = Flask(__name__)
app.debug = True
api = Api(app)


@app.route('/')
def index():
	return render_template("index.html")

api.add_resource(restapi.LoginResource, '/api/login')
api.add_resource(restapi.NewUserRegistrationResource, '/api/register')
#api.add_resource(restapi.SearchRoomsResource, '#')
#api.add_resource(restapi.PaymentInfoResource, '#')
#api.add_resource(restapi.ConfirmationScreenResource, '#')
#api.add_resource(restapi.UpdateReservationResource, '#')
#api.add_resource(restapi.CancelReservationResource, '#')
#api.add_resource(restapi.ViewReviewResource, '#')
#api.add_resource(restapi.GiveReviewResource, '#')
#api.add_resource(restapi.ReportResource, '#')


if __name__ == '__main__':
	app.run('0.0.0.0', 5000, debug=True)


