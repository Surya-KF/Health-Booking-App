from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.services.user_service import create_user, authenticate_user, get_user_by_id
from app.services.doctor_service import create_doctor
from app.services.patient_service import create_patient
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Create user
    user = create_user(data)
    
    # Create role-specific profile
    if user.role == 'doctor':
        create_doctor({
            'user_id': str(user._id),
            'specialization': data.get('specialization', ''),
            'qualification': data.get('qualification', ''),
            'bio': data.get('bio', '')
        })
    elif user.role == 'patient':
        create_patient({
            'user_id': str(user._id),
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender')
        })
    
    # Generate token
    access_token = create_access_token(
        identity=str(user._id),
        additional_claims={'role': user.role},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = authenticate_user(data.get('email'), data.get('password'))
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(
        identity=str(user._id),
        additional_claims={'role': user.role},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200
