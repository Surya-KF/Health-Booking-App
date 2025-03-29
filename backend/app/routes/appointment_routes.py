from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.appointment_service import (
    create_appointment, get_appointment_by_id, get_appointments_by_patient,
    get_appointments_by_doctor, update_appointment_status, cancel_appointment,
    complete_appointment, get_doctor_availability
)
from app.services.doctor_service import get_doctor_by_id, get_doctor_by_user_id
from app.services.patient_service import get_patient_by_user_id
from app.services.user_service import get_user_by_id
from functools import wraps

appointment_bp = Blueprint('appointments', __name__)

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

@appointment_bp.route('/', methods=['POST'])
@jwt_required()
@patient_required
def book_appointment():
    user_id = get_jwt_identity()
    patient = get_patient_by_user_id(user_id)
    
    if not patient:
        return jsonify({'message': 'Patient profile not found'}), 404
    
    data = request.get_json()
    data['patient_id'] = str(patient._id)
    
    # Check if doctor exists
    doctor = get_doctor_by_id(data.get('doctor_id'))
    if not doctor:
        return jsonify({'message': 'Doctor not found'}), 404
    
    # Check if the time slot is available
    booked_slots = get_doctor_availability(data.get('doctor_id'), data.get('date'))
    if data.get('time') in booked_slots:
        return jsonify({'message': 'This time slot is already booked'}), 400
    
    # Create appointment
    appointment = create_appointment(data)
    
    return jsonify({
        'message': 'Appointment booked successfully',
        'appointment': appointment.to_dict()
    }), 201

@appointment_bp.route('/', methods=['GET'])
@jwt_required()
def get_appointments():
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    appointments = []
    
    if role == 'patient':
        patient = get_patient_by_user_id(user_id)
        if not patient:
            return jsonify({'message': 'Patient profile not found'}), 404
        appointments = get_appointments_by_patient(str(patient._id))
    elif role == 'doctor':
        doctor = get_doctor_by_user_id(user_id)
        if not doctor:
            return jsonify({'message': 'Doctor profile not found'}), 404
        appointments = get_appointments_by_doctor(str(doctor._id))
    else:
        return jsonify({'message': 'Unauthorized'}), 403
    
    result = []
    for appt in appointments:
        appt_dict = appt.to_dict()
        
        # Add doctor details
        doctor = get_doctor_by_id(appt.doctor_id)
        if doctor:
            doctor_user = get_user_by_id(doctor.user_id)
            if doctor_user:
                appt_dict['doctor'] = {
                    'id': str(doctor._id),
                    'name': f"{doctor_user.first_name} {doctor_user.last_name}",
                    'specialization': doctor.specialization
                }
        
        # Add patient details
        patient = get_patient_by_id(appt.patient_id)
        if patient:
            patient_user = get_user_by_id(patient.user_id)
            if patient_user:
                appt_dict['patient'] = {
                    'id': str(patient._id),
                    'name': f"{patient_user.first_name} {patient_user.last_name}"
                }
        
        result.append(appt_dict)
    
    return jsonify(result), 200

@appointment_bp.route('/<appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    appointment = get_appointment_by_id(appointment_id)
    
    if not appointment:
        return jsonify({'message': 'Appointment not found'}), 404
    
    # Check if user has access to this appointment
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role == 'patient':
        patient = get_patient_by_user_id(user_id)
        if not patient or str(patient._id) != appointment.patient_id:
            return jsonify({'message': 'Unauthorized access'}), 403
    elif role == 'doctor':
        doctor = get_doctor_by_user_id(user_id)
        if not doctor or str(doctor._id) != appointment.doctor_id:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    appt_dict = appointment.to_dict()
    
    # Add doctor details
    doctor = get_doctor_by_id(appointment.doctor_id)
    if doctor:
        doctor_user = get_user_by_id(doctor.user_id)
        if doctor_user:
            appt_dict['doctor'] = {
                'id': str(doctor._id),
                'name': f"{doctor_user.first_name} {doctor_user.last_name}",
                'specialization': doctor.specialization
            }
    
    # Add patient details
    patient = get_patient_by_id(appointment.patient_id)
    if patient:
        patient_user = get_user_by_id(patient.user_id)
        if patient_user:
            appt_dict['patient'] = {
                'id': str(patient._id),
                'name': f"{patient_user.first_name} {patient_user.last_name}"
            }
    
    return jsonify(appt_dict), 200

@appointment_bp.route('/<appointment_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_appointment_route(appointment_id):
    appointment = get_appointment_by_id(appointment_id)
    
    if not appointment:
        return jsonify({'message': 'Appointment not found'}), 404
    
    # Check if user has access to cancel this appointment
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role == 'patient':
        patient = get_patient_by_user_id(user_id)
        if not patient or str(patient._id) != appointment.patient_id:
            return jsonify({'message': 'Unauthorized access'}), 403
    elif role == 'doctor':
        doctor = get_doctor_by_user_id(user_id)
        if not doctor or str(doctor._id) != appointment.doctor_id:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    updated_appointment = cancel_appointment(appointment_id)
    
    return jsonify({
        'message': 'Appointment cancelled successfully',
        'appointment': updated_appointment.to_dict()
    }), 200

@appointment_bp.route('/<appointment_id>/complete', methods=['PUT'])
@jwt_required()
@doctor_required
def complete_appointment_route(appointment_id):
    appointment = get_appointment_by_id(appointment_id)
    
    if not appointment:
        return jsonify({'message': 'Appointment not found'}), 404
    
    # Check if doctor has access to complete this appointment
    user_id = get_jwt_identity()
    doctor = get_doctor_by_user_id(user_id)
    
    if not doctor or str(doctor._id) != appointment.doctor_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    updated_appointment = complete_appointment(appointment_id)
    
    return jsonify({
        'message': 'Appointment completed successfully',
        'appointment': updated_appointment.to_dict()
    }), 200

@appointment_bp.route('/availability/<doctor_id>', methods=['GET'])
@jwt_required()
def check_availability(doctor_id):
    date = request.args.get('date')
    
    if not date:
        return jsonify({'message': 'Date parameter is required'}), 400
    
    doctor = get_doctor_by_id(doctor_id)
    if not doctor:
        return jsonify({'message': 'Doctor not found'}), 404
    
    # Get doctor's available time slots
    doctor_availability = doctor.availability
    
    # Get booked slots for the date
    booked_slots = get_doctor_availability(doctor_id, date)
    
    # Filter out booked slots
    available_slots = [slot for slot in doctor_availability if slot not in booked_slots]
    
    return jsonify({
        'doctor_id': doctor_id,
        'date': date,
        'available_slots': available_slots,
        'booked_slots': booked_slots
    }), 200