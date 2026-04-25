import hashlib

def generate_hash(password: str):
    hashed = hashlib.sha256(password.encode()).hexdigest()
    print(f"Password: {password}")
    print(f"Hash:     {hashed}")
    return hashed

generate_hash("python")