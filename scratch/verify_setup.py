
import os
import asyncio
import sqlite3
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

async def verify():
    print("--- RIMN SYSTEM VERIFICATION ---")
    
    # 1. Check .env
    # Current file is in scratch/, so parent is rimn/
    base_dir = Path(__file__).resolve().parent.parent
    env_path = base_dir / ".env"
    if not env_path.exists():
        print("[!] .env file missing at", env_path)
    else:
        load_dotenv(env_path)
        print("[+] .env file found.")

    # 2. Check Database
    db_path = base_dir / "rimn.db"
    if not db_path.exists():
        print("[!] Database missing at", db_path)
    else:
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"[+] Database found. Tables: {len(tables)}")
            conn.close()
        except Exception as e:
            print(f"[!] Database error: {e}")

    # 3. Check Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[!] GEMINI_API_KEY not found in .env")
    else:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-3-flash-preview')
            # Small test call
            response = model.generate_content("Health check. Reply with 'OK'.")
            if "OK" in response.text.upper():
                print("[+] Gemini API (Gemini 3 Flash) is operational.")
            else:
                print(f"[?] Gemini API responded unexpectedly: {response.text}")
        except Exception as e:
            print(f"[!] Gemini API Error: {e}")

    # 4. Check Directory Structure
    dirs = ["uploads", "ml/checkpoints", "ml/results"]
    for d in dirs:
        p = base_dir / d
        if p.exists():
            print(f"[+] Directory {d} exists.")
        else:
            p.mkdir(parents=True, exist_ok=True)
            print(f"[+] Created directory {d}.")

    print("--- VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(verify())
