from datetime import datetime

class Appointment:
    def __init__(self, patient_id, doctor_id, date, time, status="scheduled", 
                 notes=None, is_telemedicine=False, created_at=None, updated_at=None, _id=None):
        self._id = _id
        self.patient_id = patient_id
        self.doctor_id = doctor_id
        self.date = date
        self.time = time
        self.status = status  # 'scheduled', 'completed', 'cancelled'
        self.notes = notes
        self.is_telemedicine = is_telemedicine
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "patient_id": str(self.patient_id),
            "doctor_id": str(self.doctor_id),
            "date": self.date,
            "time": self.time,
            "status": self.status,
            "notes": self.notes,
            "is_telemedicine": self.is_telemedicine,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
