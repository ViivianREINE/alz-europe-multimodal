from passlib.context import CryptContext
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
print(pwd_context.verify('password123', '$2b$12$mTrGkeqvTK4gEirorP3E9e6fnrsGLdrar5hp8uYvTGv3R.lVpFekq'))
