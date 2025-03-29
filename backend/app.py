from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from app.routes.auth_routes import auth_bp
from app.routes.doctor_routes import doctor_bp
from app.routes.patient_routes import patient_bp
from app.routes.appointment_routes import appointment_bp

app = Flask(__name__)
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
app.register_blueprint(patient_bp, url_prefix='/api/patients')
app.register_blueprint(appointment_bp, url_prefix='/api/appointments')

@app.route('/')
def index():
    return jsonify({'message': 'Welcome to Health Booking System API'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
