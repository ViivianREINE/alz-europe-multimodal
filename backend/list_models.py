import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyD7uUUozMpfRRjmXmip5zZux09QoFewKtA")

print("Listing models...")
for m in genai.list_models():
  if 'generateContent' in m.supported_generation_methods:
    print(m.name)
