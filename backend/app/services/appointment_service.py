from app.utils.db import db
from app.models.appointment import Appointment
from bson.objectid import ObjectId
from datetime import datetime

appointments_collection = db.get_collection('appointments')

def create_appointment(appointment_data):
    appointment = Appointment(
        patient_id=appointment_data['patient_id'],
        doctor_id=appointment_data['doctor_id'],
        date=appointment_data['date'],
        time=appointment_data['time'],
        status=appointment_data.get('status', 'scheduled'),
        notes=appointment_data.get('notes'),
        is_telemedicine=appointment_data.get('is_telemedicine', False)
    )
    
    result = appointments_collection.insert_one(appointment.__dict__)
    appointment._id = result.inserted_id
    return appointment

def get_appointment_by_id(appointment_id):
    appointment_data = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if appointment_data:
        return Appointment(**appointment_data)
    return None

def get_appointments_by_patient(patient_id):
    appointments = []
    for appt in appointments_collection.find({"patient_id": patient_id}):
        appointments.append(Appointment(**appt))
    return appointments

def get_appointments_by_doctor(doctor_id):
    appointments = []
    for appt in appointments_collection.find({"doctor_id": doctor_id}):
        appointments.append(Appointment(**appt))
    return appointments

def update_appointment_status(appointment_id, status):
    appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    return get_appointment_by_id(appointment_id)

def cancel_appointment(appointment_id):
    return update_appointment_status(appointment_id, "cancelled")

def complete_appointment(appointment_id):
    return update_appointment_status(appointment_id, "completed")

def get_doctor_availability(doctor_id, date):
    # Get all appointments for the doctor on the given date
    booked_slots = []
    for appt in appointments_collection.find({"doctor_id": doctor_id, "date": date, "status": {"$ne": "cancelled"}}):
        booked_slots.append(appt["time"])
    
    return booked_slots
