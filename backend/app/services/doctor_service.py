from app.utils.db import db
from app.models.doctor import Doctor
from bson.objectid import ObjectId

doctors_collection = db.get_collection('doctors')

def create_doctor(doctor_data):
    doctor = Doctor(
        user_id=doctor_data['user_id'],
        specialization=doctor_data['specialization'],
        qualification=doctor_data['qualification'],
        bio=doctor_data.get('bio'),
        availability=doctor_data.get('availability', [])
    )
    
    result = doctors_collection.insert_one(doctor.__dict__)
    doctor._id = result.inserted_id
    return doctor

def get_doctor_by_id(doctor_id):
    doctor_data = doctors_collection.find_one({"_id": ObjectId(doctor_id)})
    if doctor_data:
        return Doctor(**doctor_data)
    return None

def get_doctor_by_user_id(user_id):
    doctor_data = doctors_collection.find_one({"user_id": user_id})
    if doctor_data:
        return Doctor(**doctor_data)
    return None

def get_all_doctors():
    doctors = []
    for doc in doctors_collection.find():
        doctors.append(Doctor(**doc))
    return doctors

def update_doctor(doctor_id, update_data):
    doctors_collection.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": update_data}
    )
    
    return get_doctor_by_id(doctor_id)

def update_availability(doctor_id, availability):
    doctors_collection.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": {"availability": availability}}
    )
    
    return get_doctor_by_id(doctor_id)
