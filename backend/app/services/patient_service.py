from app.utils.db import db
from app.models.patient import Patient
from bson.objectid import ObjectId

patients_collection = db.get_collection('patients')

def create_patient(patient_data):
    patient = Patient(
        user_id=patient_data['user_id'],
        date_of_birth=patient_data.get('date_of_birth'),
        gender=patient_data.get('gender'),
        medical_history=patient_data.get('medical_history', []),
        allergies=patient_data.get('allergies', [])
    )
    
    result = patients_collection.insert_one(patient.__dict__)
    patient._id = result.inserted_id
    return patient

def get_patient_by_id(patient_id):
    patient_data = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if patient_data:
        return Patient(**patient_data)
    return None

def get_patient_by_user_id(user_id):
    patient_data = patients_collection.find_one({"user_id": user_id})
    if patient_data:
        return Patient(**patient_data)
    return None

def update_patient(patient_id, update_data):
    patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": update_data}
    )
    
    return get_patient_by_id(patient_id)
