import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing with key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, say 'Key Working' if you can hear me.")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
