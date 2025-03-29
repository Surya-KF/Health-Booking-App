class Patient:
    def __init__(self, user_id, date_of_birth=None, gender=None, 
                 medical_history=None, allergies=None, _id=None):
        self._id = _id
        self.user_id = user_id
        self.date_of_birth = date_of_birth
        self.gender = gender
        self.medical_history = medical_history or []
        self.allergies = allergies or []
    
    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "user_id": str(self.user_id),
            "date_of_birth": self.date_of_birth,
            "gender": self.gender,
            "medical_history": self.medical_history,
            "allergies": self.allergies
        }
