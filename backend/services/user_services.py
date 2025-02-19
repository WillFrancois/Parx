from pocketbase import PocketBase as pb
import os
from dotenv import load_dotenv, dotenv_values
from authentication_services import hash_password

load_dotenv()
# get superuser data from enviorment
admin_email = os.getenv('ADMIN_EMAIL')
admin_password = os.getenv('ADMIN_PASSWORD')

client = pb('http://127.0.0.1:8090') # Enter URL for pocketbase here


def create_user(email,password,emailVisibility=False,verified=False,cityOfficial=False):
    superuser_data = client.admins.auth_with_password(admin_email,admin_password)
    superuser_data.is_valid
    password_hashed = hash_password(password).decode()
    client.collection("users").create(
        {
        "password": password_hashed,
        "passwordConfirm": password_hashed,
        "email": email,
        "emailVisibility": emailVisibility,
        "verified": verified,
        "cityOfficial": cityOfficial
    }
    )
    client.auth_store.clear()

create_user("test@gmail.com","testpass")