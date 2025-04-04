import bcrypt
from .database_services import db_pepper

def hash_password(password):
    password = password.encode('utf-8')
    password_hashed = bcrypt.hashpw(password, db_pepper)
    return password_hashed

def check_password_hash(password,hash):
    return bcrypt.checkpw(password,hash)
