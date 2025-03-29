from datetime import datetime

class User:
    def __init__(self, username, email, password, role, first_name=None, last_name=None, 
                 phone=None, created_at=None, updated_at=None, _id=None):
        self._id = _id
        self.username = username
        self.email = email
        self.password = password
        self.role = role  # 'patient', 'doctor', 'admin'
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
