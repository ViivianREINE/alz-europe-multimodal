import requests; print(requests.post('http://127.0.0.1:8000/auth/login', json={'email': 'student@rimn.ai', 'password': 'password123'}).json())
