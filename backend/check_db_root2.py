import sqlite3; conn=sqlite3.connect('../rimn.db'); print(conn.execute('SELECT email, hashed_password FROM users').fetchall())
