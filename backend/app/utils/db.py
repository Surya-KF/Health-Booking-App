from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGO_URI"))
        self.db = self.client.health_booking
        
    def get_collection(self, collection_name):
        return self.db[collection_name]

db = Database()
