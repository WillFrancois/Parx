import bcrypt

def hash_password(password):
    password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    password_hashed = bcrypt.hashpw(password,salt)
    return password_hashed

def check_password_hash(password,hash):
    return bcrypt.checkpw(password,hash)