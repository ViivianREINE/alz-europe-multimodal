
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(r'd:\RVCE-6th-SEM\EL-MAIN\rimn\.env')
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("GEMINI_API_KEY not found in .env")
else:
    try:
        genai.configure(api_key=api_key)
        models = [m.name for m in genai.list_models()]
        targets = ['models/gemini-1.5-flash', 'models/gemini-2.0-flash', 'models/gemini-2.5-flash', 'models/gemini-3-flash-preview']
        for t in targets:
            print(f"{t}: {'EXISTS' if t in models else 'NOT FOUND'}")
    except Exception as e:
        print(f"Error: {e}")
