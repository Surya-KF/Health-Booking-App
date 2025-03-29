from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.patient_service import get_patient_by_id, get_patient_by_user_id, update_patient
from app.services.user_service import get_user_by_id
from functools import wraps

patient_bp = Blueprint('patients', __name__)

# Custom decorator to check if user is a patient
def patient_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        jwt_data = get_jwt()
        if jwt_data.get('role') != 'patient':
            return jsonify({'message': 'Patient access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# Custom decorator to check if user is a doctor
def doctor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        jwt_data = get_jwt()
        if jwt_data.get('role') != 'doctor':
            return jsonify({'message': 'Doctor access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@patient_bp.route('/profile', methods=['GET'])
@jwt_required()
@patient_required
def get_patient_profile():
    user_id = get_jwt_identity()
    patient = get_patient_by_user_id(user_id)
    
    if not patient:
        return jsonify({'message': 'Patient profile not found'}), 404
    
    patient_dict = patient.to_dict()
    user = get_user_by_id(patient.user_id)
    if user:
        patient_dict.update({
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'phone': user.phone
        })
    
    return jsonify(patient_dict), 200

@patient_bp.route('/profile', methods=['PUT'])
@jwt_required()
@patient_required
def update_patient_profile():
    user_id = get_jwt_identity()
    patient = get_patient_by_user_id(user_id)
    
    if not patient:
        return jsonify({'message': 'Patient profile not found'}), 404
    
    data = request.get_json()
    updated_patient = update_patient(str(patient._id), data)
    
    return jsonify({
        'message': 'Patient profile updated successfully',
        'patient': updated_patient.to_dict()
    }), 200

@patient_bp.route('/<patient_id>', methods=['GET'])
@jwt_required()
@doctor_required
def get_patient(patient_id):
    patient = get_patient_by_id(patient_id)
    
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404
    
    patient_dict = patient.to_dict()
    user = get_user_by_id(patient.user_id)
    if user:
        patient_dict.update({
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'phone': user.phone
        })
    
    return jsonify(patient_dict), 200
