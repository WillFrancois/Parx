from dotenv import load_dotenv
import os
from pocketbase import PocketBase as pb

load_dotenv()
# get superuser data from enviorment
admin_email = os.getenv('ADMIN_EMAIL')
admin_password = os.getenv('ADMIN_PASSWORD')
pb_client = os.getenv('PB_URL')
db_pepper = os.getenv('PEPPER').encode('utf-8')


client = pb(pb_client) 


def verify_db(func):
    def wrapper(*args,**kwargs):
        superuser_data = client.admins.auth_with_password(admin_email,admin_password)
        superuser_data.is_valid
        result = func(*args,**kwargs)
        client.auth_store.clear()
        return result
    return wrapper
        
