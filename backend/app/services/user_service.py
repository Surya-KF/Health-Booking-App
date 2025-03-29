from app.utils.db import db
from app.models.user import User
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
users_collection = db.get_collection('users')

def create_user(user_data):
    # Hash the password
    user_data['password'] = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
    
    # Create user object
    user = User(
        username=user_data['username'],
        email=user_data['email'],
        password=user_data['password'],
        role=user_data['role'],
        first_name=user_data.get('first_name'),
        last_name=user_data.get('last_name'),
        phone=user_data.get('phone')
    )
    
    # Insert into database
    result = users_collection.insert_one(user.__dict__)
    user._id = result.inserted_id
    return user

def get_user_by_id(user_id):
    user_data = users_collection.find_one({"_id": ObjectId(user_id)})
    if user_data:
        return User(**user_data)
    return None

def get_user_by_email(email):
    user_data = users_collection.find_one({"email": email})
    if user_data:
        return User(**user_data)
    return None

def authenticate_user(email, password):
    user = get_user_by_email(email)
    if user and bcrypt.check_password_hash(user.password, password):
        return user
    return None

def update_user(user_id, update_data):
    if 'password' in update_data:
        update_data['password'] = bcrypt.generate_password_hash(update_data['password']).decode('utf-8')
    
    update_data['updated_at'] = datetime.utcnow()
    
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    return get_user_by_id(user_id)
