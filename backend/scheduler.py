import schedule
import time
from app.services.reminder_service import send_appointment_reminder

def run_scheduler():
    # Schedule the reminder to run every day at 10:00 AM
    schedule.every().day.at("10:00").do(send_appointment_reminder)
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    run_scheduler()
