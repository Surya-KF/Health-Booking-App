class Doctor:
    def __init__(self, user_id, specialization, qualification, bio=None, 
                 availability=None, _id=None):
        self._id = _id
        self.user_id = user_id
        self.specialization = specialization
        self.qualification = qualification
        self.bio = bio
        self.availability = availability or []  # List of available time slots
    
    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "user_id": str(self.user_id),
            "specialization": self.specialization,
            "qualification": self.qualification,
            "bio": self.bio,
            "availability": self.availability
        }
