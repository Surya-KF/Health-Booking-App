from app.utils.db import db
from app.models.appointment import Appointment
from app.services.user_service import get_user_by_id
from app.services.doctor_service import get_doctor_by_id
from app.services.patient_service import get_patient_by_id
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

appointments_collection = db.get_collection('appointments')

def send_email(to_email, subject, body):
    """Send email using SMTP"""
    try:
        # Email configuration
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_username = os.getenv('SMTP_USERNAME')
        smtp_password = os.getenv('SMTP_PASSWORD')
        from_email = os.getenv('FROM_EMAIL')
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def send_appointment_reminder():
    """Send reminders for appointments scheduled for tomorrow"""
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    # Find all appointments for tomorrow
    appointments = []
    for appt in appointments_collection.find({"date": tomorrow, "status": "scheduled"}):
        appointments.append(Appointment(**appt))
    
    for appointment in appointments:
        # Get patient details
        patient = get_patient_by_id(appointment.patient_id)
        if not patient:
            continue
        
        patient_user = get_user_by_id(patient.user_id)
        if not patient_user or not patient_user.email:
            continue
        
        # Get doctor details
        doctor = get_doctor_by_id(appointment.doctor_id)
        if not doctor:
            continue
        
        doctor_user = get_user_by_id(doctor.user_id)
        if not doctor_user:
            continue
        
        # Prepare email content
        subject = "Reminder: Your Doctor Appointment Tomorrow"
        body = f"""
        <html>
        <body>
            <h2>Appointment Reminder</h2>
            <p>Dear {patient_user.first_name},</p>
            <p>This is a reminder that you have an appointment scheduled for tomorrow:</p>
            <ul>
                <li><strong>Date:</strong> {appointment.date}</li>
                <li><strong>Time:</strong> {appointment.time}</li>
                <li><strong>Doctor:</strong> Dr. {doctor_user.first_name} {doctor_user.last_name}</li>
                <li><strong>Specialization:</strong> {doctor.specialization}</li>
            </ul>
            <p>Please arrive 15 minutes before your scheduled appointment time.</p>
            <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
            <p>Thank you for choosing our health services!</p>
        </body>
        </html>
        """
        
        # Send email
        send_email(patient_user.email, subject, body)
