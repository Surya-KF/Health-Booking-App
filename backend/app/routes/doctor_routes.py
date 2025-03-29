from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.doctor_service import (
    get_all_doctors, get_doctor_by_id, update_doctor, 
    update_availability, get_doctor_by_user_id
)
from app.services.user_service import get_user_by_id
from functools import wraps

doctor_bp = Blueprint('doctors', __name__)

# Custom decorator to check if user is a doctor
def doctor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        jwt_data = get_jwt()
        if jwt_data.get('role') != 'doctor':
            return jsonify({'message': 'Doctor access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# Custom decorator to check if user is an admin
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        jwt_data = get_jwt()
        if jwt_data.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@doctor_bp.route('/', methods=['GET'])
def get_doctors():
    doctors = get_all_doctors()
    result = []
    
    for doctor in doctors:
        doctor_dict = doctor.to_dict()
        user = get_user_by_id(doctor.user_id)
        if user:
            doctor_dict.update({
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'phone': user.phone
            })
        result.append(doctor_dict)
    
    return jsonify(result), 200

@doctor_bp.route('/<doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = get_doctor_by_id(doctor_id)
    
    if not doctor:
        return jsonify({'message': 'Doctor not found'}), 404
    
    doctor_dict = doctor.to_dict()
    user = get_user_by_id(doctor.user_id)
    if user:
        doctor_dict.update({
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'phone': user.phone
        })
    
    return jsonify(doctor_dict), 200

@doctor_bp.route('/profile', methods=['GET'])
@jwt_required()
@doctor_required
def get_doctor_profile():
    user_id = get_jwt_identity()
    doctor = get_doctor_by_user_id(user_id)
    
    if not doctor:
        return jsonify({'message': 'Doctor profile not found'}), 404
    
    doctor_dict = doctor.to_dict()
    user = get_user_by_id(doctor.user_id)
    if user:
        doctor_dict.update({
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'phone': user.phone
        })
    
    return jsonify(doctor_dict), 200

@doctor_bp.route('/profile', methods=['PUT'])
@jwt_required()
@doctor_required
def update_doctor_profile():
    user_id = get_jwt_identity()
    doctor = get_doctor_by_user_id(user_id)
    
    if not doctor:
        return jsonify({'message': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    updated_doctor = update_doctor(str(doctor._id), data)
    
    return jsonify({
        'message': 'Doctor profile updated successfully',
        'doctor': updated_doctor.to_dict()
    }), 200

@doctor_bp.route('/availability', methods=['PUT'])
@jwt_required()
@doctor_required
def set_availability():
    user_id = get_jwt_identity()
    doctor = get_doctor_by_user_id(user_id)
    
    if not doctor:
        return jsonify({'message': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    availability = data.get('availability', [])
    
    updated_doctor = update_availability(str(doctor._id), availability)
    
    return jsonify({
        'message': 'Availability updated successfully',
        'doctor': updated_doctor.to_dict()
    }), 200
