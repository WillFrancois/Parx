from pocketbase import PocketBase as pb
import os
from dotenv import load_dotenv
from .authentication_services import hash_password

load_dotenv()
# get superuser data from enviorment
admin_email = os.getenv('ADMIN_EMAIL')
admin_password = os.getenv('ADMIN_PASSWORD')

client = pb('http://127.0.0.1:8090') # Enter URL for pocketbase here


def verify_db(func):
    def wrapper(*args,**kwargs):
        superuser_data = client.admins.auth_with_password(admin_email,admin_password)
        superuser_data.is_valid
        result = func(*args,**kwargs)
        client.auth_store.clear()
        return result
    return wrapper
        

@verify_db
def create_user(email,password,emailVisibility=False,verified=False,cityOfficial=False):
    password_hashed = hash_password(password).decode()
    result = client.collection("users").create(
        {
        "password": password_hashed,
        "passwordConfirm": password_hashed,
        "email": email,
        "emailVisibility": emailVisibility,
        "verified": verified,
        "cityOfficial": cityOfficial
    }
    )
    return result
