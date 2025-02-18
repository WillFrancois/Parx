from pocketbase import PocketBase as pb
import os

# get superuser data from enviorment
email = os.getenv('ADMIN_EMAIL')
password = os.getenv('ADMIN_PASSWORD')


client = pb('') # Enter URL for pocketbase here

# Authenticate SuperUser
superuser_data = client.collection("_superusers").auth_with_password(email,password)